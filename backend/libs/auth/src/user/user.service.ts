// 外部依赖
import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from "typeorm";
import { Subject } from "rxjs";
// 内部依赖
import {
  Email,
  RedisService,
  CommonService,
  OperateService,
  EmailService,
  QueueService,
  CreateEntity,
  UpdateEntity,
} from "@shared";
import { UserEntity, UserLogEntity } from "@auth";

/**结果 */
export interface Result {
  /**消息码 */
  code: number;

  /**消息内容 */
  msg: string;
}

/**用户服务 */
@Injectable()
export class UserService extends CommonService<UserEntity, UserLogEntity> {
  /**授权结果订阅 */
  result: Subject<Record<string, string>>;
  /**
   * 构造函数
   * @param redisSrv 缓存服务
   * @param emailSrv 邮件服务
   * @param operateSrv 操作序号服务
   * @param queueSrv 队列服务
   * @param userRepository 用户存储器
   * @param userLogRepository 用户日志存储器
   */
  constructor(
    private readonly redisSrv: RedisService,
    private readonly emailSrv: EmailService,
    protected readonly operateSrv: OperateService,
    protected readonly queueSrv: QueueService,
    @InjectRepository(UserEntity)
    protected readonly userRepository: Repository<UserEntity>,
    @InjectRepository(UserLogEntity)
    protected readonly userLogRepository: Repository<UserLogEntity>,
  ) {
    super("user", operateSrv, queueSrv, userRepository, userLogRepository);
    this.result = new Subject<Record<string, string>>();
  }

  /**
   * 获取邮箱状态
   * @param email 电子邮箱
   * @returns 用户信息
   */
  async status(email: string) {
    return this.userRepository.findOne({
      select: ["id", "status"] as FindOptionsSelect<UserEntity>,
      where: {
        email,
      } as FindOptionsWhere<UserEntity>,
    });
  }

  /**
   * 发送授权邮件
   * @param email 邮箱
   * @param room 会话房间ID
   * @returns 用户ID
   */
  async send(email: string, room: string) {
    /**用户 */
    const user = await this.status(email);
    if (!user) {
      return { code: 404, msg: `该邮箱${email}还未注册！` };
    }
    /**缓存信息 */
    const cache: object = {
      ...user,
      email,
      room,
    };
    /**随机码消息 */
    const code = await this.redisSrv.addCode("login", 100, 5, cache);
    /**邮件链接 */
    const url = `${process.env.WEB_URL}passport/callback/${code.code}`;
    /**邮件内容 */
    const mail: Email = {
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_ACCOUNT}>`,
      to: email,
      subject: "个人量化工具的授权登录邮件",
      html: `<p>请点击该<a href="${url}" target="_blank">授权登录链接</a>。</p>
      <p>或将以下地址复制到浏览器地址栏中打开：</p>
      <p>${url}</p>`,
    };
    // 发送授权邮件
    await this.emailSrv.send(mail);
    return {
      code: 0,
      msg: `已发送授权邮件，其中的激活链接有效期只有5分钟，请及时点击！`,
    };
  }

  /**
   * 校验授权码
   * @param code 授权码
   * @param valid 有效期（单位：分钟）
   * @returns 授权用户ID
   */
  async check(code: string, valid: number) {
    /**缓存数据 */
    const cache: Record<string, string> = await this.redisSrv.hgetall(
      `login:${code}`,
    );
    if (!cache || !cache.id) {
      throw new UnauthorizedException("授权地址已过期！");
    }
    /**用户ID */
    const id = Number(cache.id);
    /**用户 */
    const user = await this.show(id, "login");
    if (!user) {
      throw new UnauthorizedException("用户还未注册！");
    }
    if (!user.status) {
      throw new UnauthorizedException("用户已被禁用！");
    }
    // 删除登录随机码缓存
    await this.redisSrv.del(`login:${code}`);
    /**该用户已登录令牌 */
    const tokens = await this.redisSrv.keys(`token:${user.id}:*`);
    // 清理该用户的已登录令牌
    for (const token of tokens) {
      await this.redisSrv.del(token);
    }
    // 不是首次登录时的处理
    if (user.firstLoginAt) {
      await this.userRepository.update(user.id, {
        loginTimes: user.loginTimes + 1,
        lastLoginAt: Date.now(),
        lastSessionAt: Date.now(),
      });
    }
    // 首次登录时的处理
    else {
      await this.userRepository.update(user.id, {
        loginTimes: 1,
        firstLoginAt: Date.now(),
        lastLoginAt: Date.now(),
        lastSessionAt: Date.now(),
      });
    }
    // 发送登陆成功消息
    this.result.next({ ...cache, valid: valid.toString() });
    return { code: 0, msg: `账号${cache.email}授权成功` };
  }

  /**
   * 生成用户令牌
   * @param id 用户ID
   * @param valid 有效期（单位：分钟）
   * @returns 用户令牌
   */
  async token(id: number, valid: number) {
    return this.redisSrv.addCode(`token:${id}`, 60, valid, { id, valid });
  }

  /**
   * 用户注册
   * @param value 用户注册信息
   * @param reqId 请求日志ID
   * @returns 用户ID
   */
  async register(value: Partial<UserEntity>, reqId: number = 0) {
    /**用户存在标记 */
    const exist = await this.userRepository.existsBy({
      email: value.email,
    } as FindOptionsWhere<UserEntity>);
    if (exist) {
      throw new ConflictException(`该邮箱${value.email}已被注册！`);
    }
    /**当前用户数 */
    const count = await this.userRepository.count();
    if (count > 20) {
      throw new ConflictException(`当前系统限制最大用户数为20，已关闭注册！`);
    }
    /**用户角色 */
    const roles: string[] = count === 0 ? ["admin"] : [];
    /**创建操作序号 */
    const operateId = await this.operateSrv.create("user", "register", 0);
    /**注册时间 */
    const at = Date.now();
    /**用户数据 */
    const data: Partial<UserEntity> = {
      ...value,
      roles,
      status: true,
      create: { userId: 0, at } as CreateEntity,
      update: {
        userId: 0,
        operate: "register",
        operateId,
        reqId,
        at,
      } as UpdateEntity,
    };
    /**操作结果 */
    const result = await this.userRepository.insert(data);
    if (result.identifiers.length) {
      // 追加日志
      this.addLog(operateId);
      return Number(result.identifiers[0].id);
    }
    throw new UnprocessableEntityException(`用户${value.email}注册失败！`);
  }

  /**
   * 修改登录邮箱
   * @param id 用户ID
   * @param email 新邮箱
   * @returns 激活用户ID
   */
  async email(id: number, email: string) {
    /**用户 */
    const user = await this.show(id, "status");
    if (!user) {
      throw new NotFoundException(`当前用户不存在！`);
    }
    if (email === user.email) {
      throw new UnprocessableEntityException(`邮箱并未发生变化，无需修改！`);
    }
    /**用户存在标记 */
    const exist = await this.userRepository.existsBy({
      email,
    } as FindOptionsWhere<UserEntity>);
    // 邮箱被其他用户使用
    if (exist) {
      throw new ConflictException(`邮箱${email}已被使用，无法修改！`);
    }
    /**缓存信息 */
    const cache: object = { id, email };
    /**随机码消息 */
    const code = await this.redisSrv.addCode("activate", 100, 30, cache);
    /**激活链接 */
    const url = `${process.env.WEB_URL}passport/activate/${code.code}`;
    /**邮件内容 */
    const mail: Email = {
      from: `"${process.env.SMTP_USER}" <${process.env.SMTP_ACCOUNT}>`, // 发件人（显示名称可自定义）
      to: email, // 收件人邮箱
      subject: "个人量化工具的修改邮箱验证邮件", // 邮件主题
      html: `<p>请点击该<a href="${url}" target="_blank">新邮箱激活链接</a>。</p>
      <p>或将以下地址复制到浏览器地址栏中打开：</p>
      <p>${url}</p>`, // HTML内容（可选）
    };
    // 发送邮件
    await this.emailSrv.send(mail);
    return id;
  }

  /**
   * 激活新邮箱
   * @param code 激活码
   * @returns 激活用户ID
   */
  async activate(code: string, reqId: number = 0) {
    /**缓存数据 */
    const cache: Record<string, string> = await this.redisSrv.hgetall(
      `activate:${code}`,
    );
    if (!cache || !cache.email) {
      throw new NotFoundException("激活地址已过期！");
    }
    /**用户ID */
    const id = Number(cache.id);
    /**用户 */
    const user = await this.userRepository.findOne({
      select: [
        "id",
        "email",
        "status",
        "roles",
      ] as FindOptionsSelect<UserEntity>,
      where: {
        id,
      } as FindOptionsWhere<UserEntity>,
    });
    if (!user) {
      throw new NotFoundException("用户还未注册！");
    }
    /**检查结果 */
    const exists = await this.userRepository.existsBy({
      email: cache.email,
    } as FindOptionsWhere<UserEntity>);
    if (exists) {
      throw new ConflictException(`邮箱${cache.email}已被使用，无法修改！`);
    }
    /**创建操作序号 */
    const operateId = await this.operateSrv.create("user", "email", id);
    // 更新用户信息
    const result = await this.userRepository.update(id, {
      email: cache.email,
      update: {
        userId: id,
        operate: "chgemail",
        operateId,
        reqId,
        at: Date.now(),
      },
    });
    if (result.affected) {
      // 追加日志
      this.addLog(operateId);
      // 删除激活随机码缓存
      await this.redisSrv.del(`activate:${code}`);
      return {
        code: 0,
        msg: `用户绑定邮箱已成功修改为${cache.email}，可返回首页登录！`,
      } as Result;
    }
    throw new UnprocessableEntityException(
      `用户新邮箱${cache.email}激活失败！`,
    );
  }

  /**
   * 修改用户的最后会话时间
   * @param id 用户ID
   */
  async session(id: number) {
    await this.userRepository.update(id, { lastSessionAt: Date.now() });
  }

  /**
   * 获取用户清单（管理员管理页面）
   * @param operateId 操作序号，用于获取增量数据
   * @returns 用户清单
   */
  async index(operateId: number = -1) {
    return this.userRepository.find({
      select: [
        "id",
        "name",
        "avatar",
        "email",
        "status",
        "roles",
        "create.userId",
        "create.at",
        "update.userId",
        "update.at",
        "update.operateId",
        "update.operate",
        "update.reqId",
      ] as FindOptionsSelect<UserEntity>,
      where: {
        update: {
          operateId: MoreThan(operateId),
        },
      } as FindOptionsWhere<UserEntity>,
    });
  }

  /**
   * 获取用户详情（用户编辑页面）
   * @param id 用户ID
   * @param type 数据结果类型
   * @returns 用户详情
   */
  async show(id: number, type: "startup" | "status" | "login" | "all" = "all") {
    /**返回字段 */
    let select: FindOptionsSelect<UserEntity>;
    if (type === "startup") {
      select = [
        "id",
        "name",
        "avatar",
        "email",
        "roles",
      ] as FindOptionsSelect<UserEntity>;
    } else if (type === "status") {
      select = [
        "id",
        "email",
        "status",
        "roles",
      ] as FindOptionsSelect<UserEntity>;
    } else if (type === "login") {
      select = [
        "id",
        "email",
        "status",
        "roles",
        "loginTimes",
        "firstLoginAt",
      ] as FindOptionsSelect<UserEntity>;
    } else {
      select = [
        "id",
        "name",
        "avatar",
        "email",
        "status",
        "roles",
        "loginTimes",
        "firstLoginAt",
        "lastLoginIp",
        "lastLoginAt",
        "lastSessionAt",
        "create.userId",
        "create.at",
        "update.userId",
        "update.at",
        "update.operateId",
        "update.operate",
        "update.reqId",
      ] as FindOptionsSelect<UserEntity>;
    }
    return this.userRepository.findOne({
      select,
      where: {
        id,
      } as FindOptionsWhere<UserEntity>,
    });
  }
}
