// 外部依赖
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
// 内部依赖
import type { AppRequest } from "@shared";

export const ReqId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return Number(request.reqId ?? 0);
  },
);
