// 外部依赖
import {
  Controller,
  Get,
  Post,
  Delete,
  Headers,
  Body,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
// 内部依赖
import type { AppRequest } from "@shared";
import { UserUpdateDto, UserService, TokenService } from "@auth";

/**已登录用户控制器 */
@Controller("user")
export class UserController {
  /**
   * 构造函数
   * @param userSrv 用户服务
   * @param tokenSrv 令牌服务
   */
  constructor(
    private readonly userSrv: UserService,
    private readonly tokenSrv: TokenService,
  ) {}

  /**
   * 已登录初始化
   * @param req 请求上下文
   * @returns 用户信息
   */
  @Get("startup")
  async startup(@Req() req: AppRequest) {
    const user = await this.userSrv.show(Number(req.user?.id), "startup");
    return user;
  }

  /**
   * 刷新令牌
   * @param req 请求上下文
   * @returns 新令牌
   */
  @Post("refresh")
  refresh(
    @Headers("token") token: string,
    @Body("valid", ParseIntPipe) valid: number,
    @Req() req: AppRequest,
  ) {
    return this.tokenSrv.refresh(Number(req.user?.id), token, valid);
  }

  /**
   * 获取用户信息
   * @param req 请求上下文
   * @returns 新令牌
   */
  @Get("show")
  async show(@Req() req: AppRequest) {
    const user = await this.userSrv.show(Number(req.user?.id));
    return user;
  }

  /**
   * 更新用户信息
   * @param body 更新信息
   * @param req 请求上下文
   * @returns 用户ID
   */
  @Post("update")
  update(@Body() body: UserUpdateDto, @Req() req: AppRequest) {
    return this.userSrv.update(Number(req.user?.id), body, Number(req.reqId));
  }

  /**
   * 修改绑定邮箱
   * @param body 更新信息
   * @param req 请求上下文
   * @returns 用户ID
   */
  @Post("email")
  email(@Body("email") email: string, @Req() req: AppRequest) {
    return this.userSrv.email(Number(req.user?.id), email);
  }

  /**
   * 退出登录
   * @param token 待作废的令牌
   * @returns 作废令牌数
   */
  @Delete("logout")
  destroy(@Headers("token") token: string) {
    return this.tokenSrv.destroy(token);
  }
}
