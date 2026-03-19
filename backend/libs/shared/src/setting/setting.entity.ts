// 外部依赖
import { Entity, Column, PrimaryColumn } from "typeorm";
// 内部依赖
import { CreateEntity, UpdateEntity, LogEntity } from "@shared";

/**配置基类表 */
export abstract class SettingBaseEntity {
  /**状态，true表示可用，false表示禁用 */
  @Column({ type: "bool", name: "status", default: true, comment: "状态" })
  status: boolean;

  /**配置值 */
  @Column({ type: "json", name: "value", comment: "值" })
  value: any;

  /**更新信息 */
  @Column(() => UpdateEntity)
  update: UpdateEntity;
}

/**配置表 */
@Entity("settings")
export class SettingEntity extends SettingBaseEntity {
  /**配置编码 */
  @PrimaryColumn({ type: "text", name: "code", comment: "配置编码" })
  code: string;

  /**创建信息 */
  @Column(() => CreateEntity)
  create: CreateEntity;
}

/**配置日志表 */
@Entity("settings_logs")
export class SettingLogEntity extends SettingBaseEntity {
  /**日志信息 */
  @Column(() => LogEntity)
  log: LogEntity;

  /**配置编码 */
  @Column({ type: "text", name: "code", comment: "配置编码" })
  code: string;
}
