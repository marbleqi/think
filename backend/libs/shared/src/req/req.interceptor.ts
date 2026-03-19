// 外部依赖
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Response, Request } from "express";
import { tap, catchError } from "rxjs";
// 内部依赖
import {
  ReqUpdate,
  ReqService,
  maskData,
  AppRequest,
  QueueService,
} from "@shared";

/**全局拦截器
 *
 * 给响应报文加上请求标记，并发出响应，发送记录日志任务
 */
@Injectable()
export class ReqInterceptor implements NestInterceptor {
  /**
   * 构造函数
   * @param reqSrv 请求日志服务
   * @param queueSrv 队列服务
   */
  constructor(
    private readonly reqSrv: ReqService,
    private readonly queueSrv: QueueService,
  ) {}

  /**
   * 拦截器函数
   * @param context 处理上下文
   * @param next 函数处理后
   * @returns 响应报文可观察者
   */
  intercept(context: ExecutionContext, next: CallHandler) {
    /**
     * 更新请求日志的用户ID，请求内容和响应内容
     * 1、异步处理，避免影响响应效率
     * 2、用户ID在登录验证等请求时，无法在路由守卫阶段获得，只能在业务处理逻辑中获得，所以需要在此处再次更新
     * 3、请求内容可能存在敏感数据，需要在业务处理逻辑中脱敏，所以需要在此处更新
     * 4、响应内容只能在业务处理逻辑完成后得到，所以在此处更新
     * 5、响应报文有时候也需要脱敏，需要注意处理逻辑
     */
    /**请求上下文 */
    const req: Request = context.switchToHttp().getRequest();
    /**响应上下文 */
    const res: Response = context.switchToHttp().getResponse();
    if (req["reqId"]) {
      res.setHeader("request_id", Number(req["reqId"]));
    }
    return next.handle().pipe(
      // 请求异常时的处理
      catchError((err) => {
        console.debug("此处应处理异常", err);
        const appReq = req as AppRequest;
        if (appReq.reqId) {
          /**更新日志记录 */
          this.queueSrv.addTask(() =>
            this.reqSrv.update(Number(appReq.reqId), {
              userId: appReq.user?.id || 0,
              request: {
                headers: req.headers,
                url: req.url,
                method: req.method,
                params: req.params,
                query: req.query,
                body: maskData(req.body),
              },
              result: maskData(
                (err as { response?: unknown; status?: number }).response,
              ),
              status: (err as { status: number }).status,
              endAt: Date.now(),
            } as ReqUpdate),
          );
        }
        throw err;
      }),
      // 请求正常时的处理
      tap((data) => {
        console.debug("此处应处理正常", data);
        const appReq = req as AppRequest;
        /**更新日志记录 */
        if (appReq.reqId) {
          this.queueSrv.addTask(() =>
            this.reqSrv.update(Number(appReq.reqId), {
              userId: appReq.user?.id || 0,
              request: {
                headers: req.headers,
                url: req.url,
                method: req.method,
                params: req.params,
                query: req.query,
                body: maskData(req.body),
              },
              result: maskData(data),
              status: res.statusCode,
              endAt: Date.now(),
            } as ReqUpdate),
          );
        }
      }),
    );
  }
}
