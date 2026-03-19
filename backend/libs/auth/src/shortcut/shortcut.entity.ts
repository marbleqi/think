// 外部依赖
import { Entity, Column, PrimaryColumn } from "typeorm";

/**用户快捷方式 */
@Entity("shortcuts")
export class ShortcutEntity {
  /**用户ID */
  @PrimaryColumn({ type: "int", name: "id", comment: "用户ID" })
  id: number;

  /**快捷方式 */
  @Column({
    type: "text",
    name: "shortcuts",
    default: [],
    array: true,
    comment: "快捷方式",
  })
  shortcuts: string[];
}
