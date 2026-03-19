// 外部依赖
import {
  Controller,
  Get,
  Post,
  Delete,
  Headers,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
// 内部依赖
import { ReqId } from "@shared";
import { UserUpdateDto, UserService, TokenService } from "@auth";
import { UserId } from "@auth";

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
  async startup(@UserId() userId: number) {
    return this.userSrv.show(userId, "startup");
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
    @UserId() userId: number,
  ) {
    return this.tokenSrv.refresh(userId, token, valid);
  }

  /**
   * 获取用户信息
   * @param req 请求上下文
   * @returns 新令牌
   */
  @Get("show")
  async show(@UserId() userId: number) {
    return this.userSrv.show(userId);
  }

  /**
   * 更新用户信息
   * @param body 更新信息
   * @param req 请求上下文
   * @returns 用户ID
   */
  @Post("update")
  update(
    @Body() body: UserUpdateDto,
    @UserId() userId: number,
    @ReqId() reqId: number,
  ) {
    return this.userSrv.update(userId, body, userId, reqId);
  }

  /**
   * 修改绑定邮箱
   * @param body 更新信息
   * @param req 请求上下文
   * @returns 用户ID
   */
  @Post("email")
  email(@Body("email") email: string, @UserId() userId: number) {
    return this.userSrv.email(userId, email);
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
