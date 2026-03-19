// 外部依赖
import { IsNotEmpty, IsEmail } from "class-validator";

/**注册信息DTO */
export class RegisterDto {
  /**昵称 */
  @IsNotEmpty({ message: "昵称不能为空" })
  name: string;

  /**头像URL */
  @IsNotEmpty({ message: "头像不能为空" })
  avatar: string;

  /**电子邮箱 */
  @IsNotEmpty({ message: "电子邮箱不能为空" })
  @IsEmail({}, { message: "电子邮箱格式不正确" })
  email: string;
}

/**用户信息修改DTO */
export class UserUpdateDto {
  /**昵称 */
  @IsNotEmpty({ message: "昵称不能为空" })
  name: string;

  /**头像URL */
  @IsNotEmpty({ message: "头像URL不能为空" })
  avatar: string;
}
