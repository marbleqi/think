// 外部依赖
import { Entity, Column, PrimaryGeneratedColumn, AfterLoad } from "typeorm";

/**操作序号表 */
@Entity("operates")
export class OperateEntity {
  /**操作序号 */
  @PrimaryGeneratedColumn({ type: "bigint", name: "id", comment: "操作序号" })
  id: number;

  /**操作对象 */
  @Column({ type: "text", name: "name", comment: "操作对象" })
  name: string;

  /**操作类型 */
  @Column({ type: "text", name: "operate", comment: "操作类型" })
  operate: string;

  /**操作用户ID */
  @Column({ type: "int", name: "user_id", default: 0, comment: "操作用户ID" })
  userId: number;

  /**操作备注 */
  @Column({
    type: "text",
    name: "remark",
    default: "",
    comment: "操作备注",
  })
  remark: string;

  /**操作时间 */
  @Column({ type: "bigint", name: "at", comment: "操作时间" })
  at: number;

  /**对长整型数据进行数据转换 */
  @AfterLoad()
  operateLoad() {
    this.id = this.id ? Number(this.id) : 0;
    this.at = this.at ? Number(this.at) : 0;
  }
}
