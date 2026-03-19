// 外部依赖
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  AfterLoad,
  Unique,
} from "typeorm";
// 内部依赖
import { CreateEntity, UpdateEntity } from "@shared";
import { GroupEntity } from "../group/group.entity";
import { UserEntity } from "@auth";

/**
 * 群成员角色：
 * - owner: 创建者，拥有最高权限
 * - admin: 管理员，可以管理成员
 * - member: 普通成员
 */
export type GroupMemberRole = "owner" | "admin" | "member";

/**群成员表 */
@Entity("chat_group_members")
@Unique(["groupId", "userId"])
export class GroupMemberEntity {
  /**成员记录ID */
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "成员记录ID" })
  id: number;

  /**群组ID */
  @Column({ type: "int", name: "group_id", comment: "群组ID" })
  groupId: number;

  /**用户ID */
  @Column({ type: "int", name: "user_id", comment: "用户ID" })
  userId: number;

  /**成员角色 */
  @Column({
    type: "text",
    name: "role",
    default: "member",
    comment: "成员角色: owner/admin/member",
  })
  role: GroupMemberRole;

  /**用户是否在群中：true表示在群中，false表示已退出 */
  @Column({
    type: "bool",
    name: "is_active",
    default: true,
    comment: "是否在群中",
  })
  isActive: boolean;

  /**加入时间 */
  @Column({
    type: "bigint",
    name: "joined_at",
    default: 0,
    comment: "加入时间",
  })
  joinedAt: number;

  /**最后阅读消息时间 */
  @Column({
    type: "bigint",
    name: "last_read_at",
    default: 0,
    comment: "最后阅读消息时间",
  })
  lastReadAt: number;

  /**创建信息 */
  @Column(() => CreateEntity)
  create: CreateEntity;

  /**更新信息 */
  @Column(() => UpdateEntity)
  update: UpdateEntity;

  /**关联群组 */
  @ManyToOne(() => GroupEntity, (group) => group.members)
  group: GroupEntity;

  /**关联用户 */
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  /**对长整型数据转换 */
  @AfterLoad()
  memberLoad() {
    this.joinedAt = this.joinedAt ? Number(this.joinedAt) : 0;
    this.lastReadAt = this.lastReadAt ? Number(this.lastReadAt) : 0;
    this.create.at = this.create.at ? Number(this.create.at) : 0;
    this.update.at = this.update.at ? Number(this.update.at) : 0;
  }
}
