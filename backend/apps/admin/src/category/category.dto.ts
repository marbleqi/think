// 外部依赖
import { IsNotEmpty } from "class-validator";

/**用户信息修改DTO */
export class CategoryUpdateDto {
  /**id */
  @IsNotEmpty({ message: "id不能为空" })
  id: string;

  /**名称 */
  @IsNotEmpty({ message: "名称不能为空" })
  name: string;

  /**产品id列表 */
  @IsNotEmpty({ message: "产品id列表不能为空" })
  products: string[];

  /**授权角色 */
  @IsNotEmpty({ message: "授权角色不能为空" })
  acls: string[];

  /**排序id */
  @IsNotEmpty({ message: "排序id不能为空" })
  orderId: number;

  /**启用状态，true表示启用，false表示禁用 */
  @IsNotEmpty({ message: "状态不能为空" })
  status: boolean;
}
