// 外部依赖
import { IsNotEmpty } from "class-validator";

/**产品修改DTO */
export class ProductUpdateDto {
  /**id */
  @IsNotEmpty({ message: "id不能为空" })
  id: string;

  /**名称 */
  @IsNotEmpty({ message: "名称不能为空" })
  name: string;

  /**描述 */
  @IsNotEmpty({ message: "描述不能为空" })
  description: string;

  /**图标 */
  @IsNotEmpty({ message: "图标不能为空" })
  icon: string;

  /**链接 */
  @IsNotEmpty({ message: "链接不能为空" })
  link: string;

  /**授权角色 */
  @IsNotEmpty({ message: "授权角色不能为空" })
  acls: string[];

  /**启用状态，true表示启用，false表示禁用 */
  @IsNotEmpty({ message: "状态不能为空" })
  status: boolean;
}
