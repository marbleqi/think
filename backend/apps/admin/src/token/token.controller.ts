// 外部依赖
import { Controller, Param, Get, Delete } from "@nestjs/common";
// 内部依赖
import { Allow, TokenService } from "@auth";

/**令牌控制器 */
@Controller("admin/token")
@Allow("admin")
export class TokenController {
  /**
   * 构造函数
   * @param tokenSrv 令牌服务
   */
  constructor(private readonly tokenSrv: TokenService) {}

  /**
   * 获取令牌清单
   * @returns 令牌清单
   */
  @Get("index")
  index() {
    return this.tokenSrv.index();
  }

  /**
   * 获取令牌数量
   * @returns 令牌数量
   */
  @Get("count")
  count() {
    return this.tokenSrv.count();
  }

  /**
   * 令牌作废
   * @param token 待作废的令牌
   * @returns 作废令牌数量
   */
  @Delete(":token")
  destroy(@Param("token") token: string) {
    return this.tokenSrv.destroy(token);
  }
}
