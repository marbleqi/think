// 外部依赖
import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";
// 内部依赖
import { CreateEntity, UpdateEntity, LogEntity } from "@shared";

export abstract class KeyBaseEntity {
  @Column({ type: "text", name: "name", default: "", comment: "密钥名称" })
  name: string;

  @Column({
    type: "text",
    name: "description",
    default: "",
    comment: "密钥说明",
  })
  description: string;

  @Column({ type: "text", name: "provider", comment: "云服务商" })
  provider: "aws" | "aliyun" | "tencent";

  @Column({ type: "text", name: "key", comment: "key" })
  key: string;

  @Column({ type: "text", name: "secret", comment: "KeySecret" })
  secret: string;

  @Column({ type: "bool", name: "status", default: true, comment: "启用状态" })
  status: boolean;

  @Column(() => UpdateEntity)
  update: UpdateEntity;
}

@Entity("cloud_keys")
export class KeyEntity extends KeyBaseEntity {
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "密钥ID" })
  id: number;

  @Column(() => CreateEntity)
  create: CreateEntity;
}

@Entity("cloud_keys_logs")
export class KeyLogEntity extends KeyBaseEntity {
  @Column(() => LogEntity)
  log: LogEntity;

  @Column({ type: "int", name: "id", comment: "密钥ID" })
  @Index()
  id: number;
}
