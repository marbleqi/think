// 外部依赖
import {
  BadRequestException,
  Controller,
  Post,
  Body,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
// 内部依赖
import type { AppRequest } from "@shared";
import { RegisterDto, UserService } from "@auth";

/**未登录用户控制器 */
@Controller("passport")
export class PassportController {
  /**
   * 构造函数
   * @param userSrv 用户服务
   */
  constructor(private readonly userSrv: UserService) {}

  /**
   * 获取邮箱状态
   * @param email 邮箱
   * @returns 邮箱状态
   */
  @Post("status")
  async status(@Body("email") email: string) {
    if (!email) {
      throw new BadRequestException(`请输入有效的邮箱！`);
    }
    const user = await this.userSrv.status(email);
    if (user) {
      return user;
    } else {
      return { id: 0, status: false };
    }
  }

  /**
   * 校验授权码
   * @param code 授权码
   * @param valid 有效期（单位：分钟）
   * @returns 校验结果
   */
  @Post("check")
  check(
    @Body("code") code: string,
    @Body("valid", ParseIntPipe) valid: number,
  ) {
    if (!code) {
      throw new BadRequestException(`请输入有效的授权码！`);
    }
    return this.userSrv.check(code, valid);
  }

  /**
   * 用户注册
   * @param value 注册信息
   * @param req 请求对象
   * @returns 用户ID
   */
  @Post("register")
  register(@Body() value: RegisterDto, @Req() req: Request) {
    return this.userSrv.register(value, Number((req as AppRequest).reqId ?? 0));
  }

  /**
   * 校验激活码
   * @param code 激活码
   * @param req 请求对象
   * @returns 校验结果
   */
  @Post("activate")
  activate(@Body("code") code: string, @Req() req: Request) {
    if (!code) {
      throw new BadRequestException(`请输入有效的激活码！`);
    }
    return this.userSrv.activate(code, Number((req as AppRequest).reqId ?? 0));
  }
}
