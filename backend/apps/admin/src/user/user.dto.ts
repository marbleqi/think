// 外部依赖
import { IsNotEmpty, IsEmail } from "class-validator";

/**用户创建DTO */
export class UserCreateDto {
  /**电子邮箱 */
  @IsNotEmpty({ message: "电子邮箱不能为空" })
  @IsEmail({}, { message: "电子邮箱格式不正确" })
  email: string;

  /**昵称 */
  @IsNotEmpty({ message: "昵称不能为空" })
  name: string;

  /**头像URL */
  @IsNotEmpty({ message: "头像URL不能为空" })
  avatar: string;

  /**启用状态，true表示启用，false表示禁用 */
  status: boolean;

  /**用户授权角色 */
  roles: string[];
}

/**用户信息修改DTO */
export class UserUpdateDto {
  /**昵称 */
  name?: string;

  /**头像URL */
  avatar?: string;

  /**启用状态，true表示启用，false表示禁用 */
  status?: boolean;

  /**用户授权角色 */
  roles?: string[];
}
