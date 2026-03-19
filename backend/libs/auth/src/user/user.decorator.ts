// 外部依赖
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
// 内部依赖
import type { AppRequest } from "@shared";

export const UserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return Number(request.user?.id ?? 0);
  },
);
