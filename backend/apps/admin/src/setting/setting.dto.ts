// 外部依赖
import { IsNotEmpty } from "class-validator";

/**系统配置DTO */
export class SettingDto {
  /**配置编码 */
  @IsNotEmpty({ message: "配置编码不能为空" })
  code: string;

  /**启用状态，true表示启用，false表示禁用 */
  status?: boolean;

  /**配置值 */
  value?: any;
}
