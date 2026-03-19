// 外部依赖
import { IsNotEmpty } from "class-validator";

/**快捷方式DTO */
export class ShortcutDto {
  /**用户ID */
  @IsNotEmpty({ message: "用户ID不能为空" })
  id: number;

  /**快捷方式 */
  @IsNotEmpty({ message: "快捷方式不能为空" })
  shortcuts: string[];
}
