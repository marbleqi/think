// 外部依赖
import { Entity, Column, PrimaryColumn } from "typeorm";
// 内部依赖
import { CreateEntity, UpdateEntity, LogEntity } from "@shared";

/**产品基类表 */
export abstract class ProductBaseEntity {
  /**名称 */
  @Column({ type: "text", name: "name", default: "", comment: "名称" })
  name: string;

  /**描述 */
  @Column({ type: "text", name: "description", default: "", comment: "描述" })
  description: string;

  /**图标 */
  @Column({ type: "text", name: "icon", default: "", comment: "图标" })
  icon: string;

  /**链接 */
  @Column({ type: "text", name: "link", default: "", comment: "链接" })
  link: string;

  /**授权角色 */
  @Column({
    type: "text",
    name: "acls",
    default: [],
    array: true,
    comment: "授权角色",
  })
  acls: string[];

  /**状态，true表示可用，false表示禁用 */
  @Column({ type: "bool", name: "status", default: true, comment: "状态" })
  status: boolean;

  /**更新信息 */
  @Column(() => UpdateEntity)
  update: UpdateEntity;
}

/**产品表 */
@Entity("products")
export class ProductEntity extends ProductBaseEntity {
  /**id */
  @PrimaryColumn({ type: "text", name: "id", comment: "id" })
  id: string;

  /**创建信息 */
  @Column(() => CreateEntity)
  create: CreateEntity;
}

/**产品日志表 */
@Entity("products_logs")
export class ProductLogEntity extends ProductBaseEntity {
  /**日志信息 */
  @Column(() => LogEntity)
  log: LogEntity;

  /**id */
  @Column({ type: "text", name: "id", comment: "id" })
  id: string;
}
