// 外部依赖
import {
  UnauthorizedException,
  ForbiddenException,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AddressInfo } from "net";
import { Response, Request } from "express";
// 内部依赖
import { ReqCreate, ReqService } from "@shared";
import { UserService, TokenService } from "@auth";

const PUBLIC_PATH_PREFIX = "/passport";

/**全局路由守卫
 *
 * 统一完成token令牌访问控制和权限点访问控制
 */
@Injectable()
export class TokenGuard implements CanActivate {
  /**
   * 构造函数
   * @param reflector 反射器
   * @param reqSrv 请求日志服务
   * @param tokenSrv 令牌服务
   * @param userSrv 用户服务
   */
  constructor(
    private readonly reflector: Reflector,
    private readonly reqSrv: ReqService,
    private readonly tokenSrv: TokenService,
    private readonly userSrv: UserService,
  ) {}

  /**
   * 路由守卫函数
   * @param context 执行上下文
   * @returns 守卫通过标记
   */
  async canActivate(context: ExecutionContext) {
    /**请求时间 */
    const at = Date.now();
    /**请求上下文 */
    const req: Request = context.switchToHttp().getRequest();
    /**响应上下文 */
    const res: Response = context.switchToHttp().getResponse();
    /**请求路径 */
    const url = req.url;
    /**请求客户端IP */
    const clientIp = req.ip;
    /**响应服务端信息 */
    const addressInfo = req.socket.address() as AddressInfo;
    /**响应服务端IP */
    const serverIp = addressInfo.address;
    // 请求消息可能存在敏感信息，先写入响应上下文中，以便在需要的控制器中脱敏，最后再在拦截器之后保存到请求日志中
    const request = {
      headers: req.headers,
      url,
      method: req.method,
      params: req.params,
      query: req.query,
      body: req.body as unknown,
    };
    /**控制器 */
    const controller = context.getClass().name;
    /**方法名 */
    const action = context.getHandler().name;
    /**组装请求日志参数 */
    const params = {
      userId: 0,
      url,
      controller,
      action,
      clientIp,
      serverIp,
      startAt: at,
    } as ReqCreate;
    if (url.startsWith(PUBLIC_PATH_PREFIX)) {
      // 将请求ID添加到请求上下文
      req["reqId"] = await this.reqSrv.insert(params);
      // 返回验证通过
      return true;
    }
    /**消息头中的令牌 */
    const tokenKey = req.headers.token as string;
    /**缓存中的令牌 */
    const token = await this.tokenSrv.show(tokenKey);
    /**用户ID */
    const userId = Number((token as { id: unknown }).id) || 0;
    /**异常过滤处理 */
    const send = async (result: string, status: number = 401) => {
      /**请求日志ID */
      const reqId = await this.reqSrv.insert({
        ...params,
        userId,
        request,
        status: HttpStatus.UNAUTHORIZED,
        result,
        endAt: Date.now(),
      } as ReqCreate);
      // 将请求ID设置到响应头
      res.setHeader("request_id", reqId);
      // 抛出异常。注：路由守卫抛出异常后，将不会再调用拦截器，请求也不会再转发到控制器
      if (status === 403) {
        throw new ForbiddenException(result);
      } else {
        throw new UnauthorizedException(result);
      }
    };
    // 如果用户ID无效，则令牌验证无效
    if (!userId) {
      await send("用户令牌验证无效！");
      return false;
    }
    const user = await this.userSrv.show(userId, "status");
    if (!user) {
      await send(`用户ID${userId}验证无效！`);
      return false;
    }
    if (!user.status) {
      await send(`用户${user.email}已被禁用！`);
      return false;
    }
    // 用户身份已校验，更新用户的最后会话时间
    await this.userSrv.session(userId);
    /**当前路由需要角色 */
    const role = this.reflector.get<string>("role", context.getHandler());
    // 当路由需要角色授权时
    if (role && !user?.roles?.includes(role)) {
      await send(`用户${user?.email}没有被授权访问该接口！`, 403);
      return false;
    }
    // 其余情况为验证通过，在请求上下文中记录用户信息
    req["user"] = user;
    // 将请求ID添加到请求上下文
    req["reqId"] = await this.reqSrv.insert({ ...params, userId });
    // 返回验证通过
    return true;
  }
}
