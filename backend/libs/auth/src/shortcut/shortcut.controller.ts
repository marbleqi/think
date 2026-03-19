// 外部依赖
import {
  UnauthorizedException,
  Controller,
  Get,
  Post,
  Body,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
// 内部依赖
import type { AppRequest } from "@shared";
import { ShortcutEntity, ShortcutService } from "..";

/**快捷方式控制器 */
@Controller("shortcut")
export class ShortcutController {
  /**
   * 构造函数
   * @param shortcutSrv 快捷方式服务
   */
  constructor(private readonly shortcutSrv: ShortcutService) {}

  /**
   * 获取快捷方式
   * @param email 邮箱
   * @returns 邮箱状态
   */
  @Get()
  async show(@Req() req: Request) {
    const userId = (req as AppRequest).user?.id;
    if (!userId) {
      throw new UnauthorizedException("用户未登录");
    }
    return this.shortcutSrv.show(userId);
  }

  /**
   * 更新快捷方式
   * @param email 邮箱
   * @returns 邮箱状态
   */
  @Post()
  async update(@Body() value: ShortcutEntity, @Req() req: Request) {
    const userId = (req as AppRequest).user?.id;
    if (!userId) {
      throw new UnauthorizedException("用户未登录");
    }
    return this.shortcutSrv.update(value);
  }
}
