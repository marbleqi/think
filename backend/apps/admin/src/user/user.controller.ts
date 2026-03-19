// 外部依赖
import { Controller } from "@nestjs/common";
// 内部依赖
import { Allow, UserService, CommonController } from "@auth";
import { UserCreateDto, UserUpdateDto } from "..";

/**管理用户控制器 */
@Controller("admin/user")
@Allow("admin")
export class UserController extends CommonController<
  UserService,
  UserCreateDto,
  UserUpdateDto
> {
  /**
   * 构造函数
   * @param userSrv 用户服务
   */
  constructor(readonly userSrv: UserService) {
    super(userSrv);
  }
}
