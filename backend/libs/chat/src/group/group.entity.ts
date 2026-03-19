// 外部依赖
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  AfterLoad,
} from "typeorm";
// 内部依赖
import { CreateEntity, UpdateEntity } from "@shared";
import { GroupMemberEntity } from "../member/group-member.entity";
import { MessageEntity } from "../message/message.entity";

/**群组表基础类 */
export abstract class GroupBaseEntity {
  /**群组名称 */
  @Column({ type: "text", name: "name", default: "", comment: "群组名称" })
  name: string;

  /**群组描述 */
  @Column({
    type: "text",
    name: "description",
    default: "",
    comment: "群组描述",
  })
  description: string;

  /**群组头像URL */
  @Column({ type: "text", name: "avatar", default: "", comment: "群组头像URL" })
  avatar: string;

  /**是否启用，true表示启用，false表示禁用 */
  @Column({ type: "bool", name: "status", default: true, comment: "是否启用" })
  status: boolean;

  /**是否公开：true表示公开群，任何人可加入；false表示需要邀请 */
  @Column({
    type: "bool",
    name: "is_public",
    default: false,
    comment: "是否公开",
  })
  isPublic: boolean;

  /**创建信息 */
  @Column(() => CreateEntity)
  create: CreateEntity;

  /**更新信息 */
  @Column(() => UpdateEntity)
  update: UpdateEntity;

  /**群组成员关联 */
  @OneToMany(() => GroupMemberEntity, (member) => member.group)
  members: GroupMemberEntity[];

  /**群组消息 */
  @OneToMany(() => MessageEntity, (message) => message.group)
  messages: MessageEntity[];
}

/**群组表 */
@Entity("chat_groups")
export class GroupEntity extends GroupBaseEntity {
  /**群组ID */
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "群组ID" })
  id: number;

  /**对长整型数据转换 */
  @AfterLoad()
  groupLoad() {
    this.create.at = this.create.at ? Number(this.create.at) : 0;
    this.update.at = this.update.at ? Number(this.update.at) : 0;
  }
}
