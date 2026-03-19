// 外部依赖
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, LessThan } from "typeorm";
import { ForbiddenException } from "@nestjs/common";
// 内部依赖
import { MessageEntity } from "./message.entity";
import { SendMessageDto, GetMessagesDto } from "./message.dto";
import { GroupMemberEntity } from "../member/group-member.entity";

/**消息服务 */
@Injectable()
export class MessageService {
  /**构造函数 */
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(GroupMemberEntity)
    private readonly memberRepo: Repository<GroupMemberEntity>,
  ) {}

  /**发送消息 */
  async sendMessage(dto: SendMessageDto, userId: number) {
    // 检查用户是否在群组中
    const member = await this.memberRepo.findOne({
      where: { groupId: dto.groupId, isActive: true },
    });
    if (!member) {
      throw new ForbiddenException("您不在该群组中");
    }

    // 创建消息
    const message = this.messageRepo.create({
      groupId: dto.groupId,
      senderId: userId,
      type: dto.type || "text",
      content: dto.content,
      metadata: dto.metadata || "",
      createdAt: Date.now(),
    });

    return this.messageRepo.save(message);
  }

  /**获取消息历史 */
  async getMessages(dto: GetMessagesDto, userId: number) {
    // 检查用户是否在群组中
    const member = await this.memberRepo.findOne({
      where: { groupId: dto.groupId, isActive: true },
    });
    if (!member) {
      throw new ForbiddenException("您不在该群组中");
    }

    const limit = dto.limit || 50;
    const where: FindOptionsWhere<MessageEntity> = { groupId: dto.groupId };
    if (dto.beforeId) {
      where.id = LessThan(dto.beforeId);
    }

    // 按 ID 倒序，分页获取
    const messages = await this.messageRepo.find({
      where,
      order: { id: "DESC" },
      take: limit,
      relations: ["sender"],
      select: {
        sender: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    });

    // 返回正序（旧到新）
    return messages.reverse();
  }

  /**获取群组最新消息 */
  async getLatestMessage(groupId: number) {
    const message = await this.messageRepo.findOne({
      where: { groupId },
      order: { id: "DESC" },
      relations: ["sender"],
      select: {
        sender: {
          id: true,
          name: true,
        },
      },
    });
    return message;
  }
}
