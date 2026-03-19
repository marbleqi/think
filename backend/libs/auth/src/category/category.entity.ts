// 外部依赖
import { Entity, Column, PrimaryColumn } from "typeorm";
// 内部依赖
import { CreateEntity, UpdateEntity, LogEntity } from "@shared";

/**产品基类表 */
export abstract class CategoryBaseEntity {
  /**名称 */
  @Column({ type: "text", name: "name", default: "", comment: "名称" })
  name: string;

  /**产品id列表 */
  @Column({
    type: "text",
    name: "products",
    default: [],
    array: true,
    comment: "产品id列表",
  })
  products: string[];

  /**授权角色 */
  @Column({
    type: "text",
    name: "acls",
    default: [],
    array: true,
    comment: "授权角色",
  })
  acls: string[];

  /**排序 */
  @Column({ type: "int", name: "sort", default: 0, comment: "排序" })
  sort: number;

  /**状态，true表示可用，false表示禁用 */
  @Column({ type: "bool", name: "status", default: true, comment: "状态" })
  status: boolean;

  /**更新信息 */
  @Column(() => UpdateEntity)
  update: UpdateEntity;
}

/**分组表 */
@Entity("categorys")
export class CategoryEntity extends CategoryBaseEntity {
  /**id */
  @PrimaryColumn({ type: "text", name: "id", comment: "id" })
  id: string;

  /**创建信息 */
  @Column(() => CreateEntity)
  create: CreateEntity;
}

/**分组日志表 */
@Entity("categorys_logs")
export class CategoryLogEntity extends CategoryBaseEntity {
  /**日志信息 */
  @Column(() => LogEntity)
  log: LogEntity;

  /**id */
  @Column({ type: "text", name: "id", comment: "id" })
  id: string;
}
