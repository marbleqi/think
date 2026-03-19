// 外部依赖
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  AfterLoad,
  Index,
} from "typeorm";
// 内部依赖
import { CreateEntity } from "@shared";
import { GroupEntity } from "../group/group.entity";
import { UserEntity } from "@auth";

/**
 * 消息类型：
 * - text: 纯文本消息
 * - image: 图片消息
 * - file: 文件消息
 * - ai: AI 回复消息
 */
export type MessageType = "text" | "image" | "file" | "ai";

/**消息表 */
@Entity("chat_messages")
export class MessageEntity {
  /**消息ID */
  @PrimaryGeneratedColumn({ type: "int", name: "id", comment: "消息ID" })
  id: number;

  /**群组ID */
  @Column({ type: "int", name: "group_id", comment: "群组ID" })
  @Index()
  groupId: number;

  /**发送者用户ID，0 表示系统消息 */
  @Column({
    type: "int",
    name: "sender_id",
    default: 0,
    comment: "发送者用户ID",
  })
  senderId: number;

  /**消息类型 */
  @Column({
    type: "text",
    name: "type",
    default: "text",
    comment: "消息类型: text/image/file/ai",
  })
  type: MessageType;

  /**消息内容 */
  @Column({ type: "text", name: "content", default: "", comment: "消息内容" })
  content: string;

  /**消息元数据（json字符串，用于存储图片地址、文件信息等） */
  @Column({
    type: "text",
    name: "metadata",
    default: "",
    comment: "消息元数据",
  })
  metadata: string;

  /**是否被撤回：true表示已撤回 */
  @Column({
    type: "bool",
    name: "is_recalled",
    default: false,
    comment: "是否已撤回",
  })
  isRecalled: boolean;

  /**创建时间戳 */
  @Column({
    type: "bigint",
    name: "created_at",
    default: 0,
    comment: "创建时间戳",
  })
  createdAt: number;

  /**创建信息 */
  @Column(() => CreateEntity)
  create: CreateEntity;

  /**关联群组 */
  @ManyToOne(() => GroupEntity, (group) => group.messages)
  group: GroupEntity;

  /**关联发送者 */
  @ManyToOne(() => UserEntity)
  sender: UserEntity;

  /**对长整型数据转换 */
  @AfterLoad()
  messageLoad() {
    this.createdAt = this.createdAt ? Number(this.createdAt) : 0;
    this.create.at = this.create.at ? Number(this.create.at) : 0;
  }
}
