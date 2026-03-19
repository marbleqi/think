// 外部依赖
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  AfterLoad,
} from "typeorm";
// 内部依赖
import { CreateEntity, UpdateEntity, LogEntity } from "@shared";

/**用户表基类 */
export abstract class UserBaseEntity {
  /**昵称 */
  @Column({ type: "text", name: "name", default: "", comment: "昵称" })
  name: string;

  /**头像URL */
  @Column({ type: "text", name: "avatar", default: "", comment: "头像URL" })
  avatar: string;

  /**启用状态，true表示启用，false表示禁用 */
  @Column({ type: "bool", name: "status", default: true, comment: "启用状态" })
  status: boolean;

  /**用户授权角色 */
  @Column({
    type: "text",
    name: "roles",
    default: [],
    array: true,
    comment: "用户授权角色",
  })
  roles: string[];

  /**更新信息 */
  @Column(() => UpdateEntity)
  update: UpdateEntity;
}

/**用户表，增加登录名字段为唯一性索引 */
@Entity("users")
export class UserEntity extends UserBaseEntity {
  /**用户ID */
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "用户ID" })
  id: number;

  /**电子邮箱 */
  @Column({ type: "text", name: "email", default: "", comment: "电子邮箱" })
  @Index({ unique: true })
  email: string;

  /**创建信息 */
  @Column(() => CreateEntity)
  create: CreateEntity;

  /**登录次数 */
  @Column({ type: "int", name: "login_times", default: 0, comment: "登录次数" })
  loginTimes: number;

  /**首次登录时间 */
  @Column({
    type: "bigint",
    name: "first_login_at",
    default: 0,
    comment: "首次登录时间",
  })
  firstLoginAt: number;

  /**最后登录IP */
  @Column({
    type: "inet",
    name: "last_login_ip",
    default: "127.0.0.1",
    comment: "最后登录IP",
  })
  lastLoginIp: string;

  /**最后登录时间 */
  @Column({
    type: "bigint",
    name: "last_login_at",
    default: 0,
    comment: "最后登录时间",
  })
  lastLoginAt: number;

  /**最后会话时间 */
  @Column({
    type: "bigint",
    name: "last_session_at",
    default: 0,
    comment: "最后会话时间",
  })
  lastSessionAt: number;

  /**对长整型数据返回时，进行数据转换 */
  @AfterLoad()
  userLoad() {
    this.firstLoginAt = this.firstLoginAt ? Number(this.firstLoginAt) : 0;
    this.lastLoginAt = this.lastLoginAt ? Number(this.lastLoginAt) : 0;
    this.lastSessionAt = this.lastSessionAt ? Number(this.lastSessionAt) : 0;
  }
}

/**用户日志表 */
@Entity("users_logs")
export class UserLogEntity extends UserBaseEntity {
  /**日志信息 */
  @Column(() => LogEntity)
  log: LogEntity;

  /**用户ID */
  @Column({ type: "int", name: "id", comment: "用户ID" })
  @Index()
  id: number;

  /**电子邮箱 */
  @Column({ type: "text", name: "email", default: "", comment: "电子邮箱" })
  email: string;
}
