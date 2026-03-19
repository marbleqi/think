// 外部依赖
import { Request } from "express";

/**用户负载信息 */
export interface UserPayload {
  /**用户ID */
  id: number;
  /**扩展属性 */
  [key: string]: unknown;
}

declare module "express" {
  interface Request {
    /**用户信息 */
    user?: unknown;
    /**请求日志ID */
    reqId?: number;
  }
}

/**应用请求类型 */
export type AppRequest = Request & {
  /**用户负载信息 */
  user?: UserPayload;
  /**请求日志ID */
  reqId?: number;
};
