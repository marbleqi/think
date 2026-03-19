// 外部依赖
import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";
// 内部依赖
import { CreateEntity, UpdateEntity, LogEntity } from "@shared";

export abstract class KongBaseEntity {
  @Column({ type: "text", name: "name", default: "", comment: "实例名称" })
  name: string;

  @Column({
    type: "text",
    name: "description",
    default: "",
    comment: "实例说明",
  })
  description: string;

  @Column({ type: "text", name: "url", default: "", comment: "接口地址" })
  url: string;

  @Column({ type: "bool", name: "status", default: true, comment: "启用状态" })
  status: boolean;

  @Column(() => UpdateEntity)
  update: UpdateEntity;
}

@Entity("kongs")
export class KongEntity extends KongBaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "实例ID" })
  id: number;

  @Column(() => CreateEntity)
  create: CreateEntity;
}

@Entity("kongs_logs")
export class KongLogEntity extends KongBaseEntity {
  @Column(() => LogEntity)
  log: LogEntity;

  @Column({ type: "int", name: "id", comment: "实例ID" })
  @Index()
  id: number;
}
