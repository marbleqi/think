// 外部依赖
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
// 内部依赖
import { ReqCreate, ReqUpdate, ReqDto, ReqEntity } from "@shared";

/**请求日志服务 */
@Injectable()
export class ReqService {
  /**
   * 构造函数
   * @param reqRepository 请求日志存储器
   */
  constructor(
    @InjectRepository(ReqEntity)
    private readonly reqRepository: Repository<ReqEntity>,
  ) {}

  /**
   * 创建请求日志
   * @param data 请求日志数据
   * @returns 请求日志ID
   */
  async insert(data: ReqCreate) {
    const result = await this.reqRepository.insert(data);
    if (result.identifiers.length) {
      return Number(result.identifiers[0].reqId);
    }
    return 0;
  }

  /**
   * 更新请求日志
   * @param reqId 请求日志ID
   * @param value 更新日志数据
   */
  async update(reqId: number, value: ReqUpdate) {
    await this.reqRepository.update(reqId, value);
  }

  /**
   * 获取请求路径列表
   * @returns 响应报文
   */
  async url() {
    /**返回的模块记录 */
    return this.reqRepository
      .createQueryBuilder("req")
      .select("DISTINCT req.url", "url")
      .getRawMany();
  }

  /**
   * 获取控制器列表
   * @returns 响应报文
   */
  async controller() {
    /**返回的控制器记录 */
    return this.reqRepository
      .createQueryBuilder("req")
      .select("DISTINCT req.controller", "controller")
      .getRawMany();
  }

  /**
   * 获取方法列表
   * @param controller 控制器名
   * @returns 方法列表
   */
  async action(controller: string) {
    return this.reqRepository
      .createQueryBuilder("req")
      .select("DISTINCT req.action", "action")
      .where("req.controller = :controller", { controller })
      .getRawMany();
  }

  /**
   * 搜索请求日志记录
   * @param value 请求日志搜索条件
   * @param reqId 当前请求ID（去除当前日志ID）
   * @returns 响应报文
   */
  async index(value: ReqDto, reqId?: number) {
    if (reqId === undefined) {
      reqId = 0;
    }
    let query: SelectQueryBuilder<ReqEntity> = this.reqRepository
      .createQueryBuilder("req")
      .select([
        "req.reqId",
        "req.userId",
        "req.url",
        "req.controller",
        "req.action",
        "req.status",
        "req.clientIp",
        "req.serverIp",
        "req.startAt",
        "req.endAt",
      ])
      .where("req.req_id != :reqId", { reqId });
    // 搜索条件增加用户ID
    if (value.userId && Number(value.userId)) {
      query = query.andWhere("req.user_id = :userId", {
        userId: Number(value.userId),
      });
    }
    // 搜索条件增加模块
    if (value.url) {
      query = query.andWhere("req.url = :url", {
        url: value.url,
      });
    }
    // 搜索条件增加控制器
    if (value.controller) {
      query = query.andWhere("req.controller = :controller", {
        controller: value.controller,
      });
    }
    // 搜索条件增加方法
    if (value.action) {
      query = query.andWhere("req.action = :action", {
        action: value.action,
      });
    }
    // 搜索条件增加状态码
    if (value.status === 200) {
      query = query.andWhere("req.status = 200");
    } else {
      query = query.andWhere("req.status != 200");
    }
    // 搜索条件请求时间
    if (value.startAt) {
      query = query.andWhere("req.start_at >= :startAt", {
        startAt: Number(value.startAt),
      });
    }
    // 搜索条件响应时间
    if (value.endAt) {
      query = query.andWhere("req.end_at <= :endAt", {
        endAt: Number(value.endAt),
      });
    }
    return query.getMany();
  }

  /**
   * 获取日志详情
   * @param reqId 日志ID
   * @returns 响应报文
   */
  async show(reqId: number) {
    return this.reqRepository.findOneBy({ reqId });
  }
}
