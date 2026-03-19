// 外部依赖
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";
import {
  UnprocessableEntityException,
  ForbiddenException,
} from "@nestjs/common";
// 内部依赖
import { GroupEntity, GroupBaseEntity } from "./group.entity";
import { CreateGroupDto, UpdateGroupDto } from "./group.dto";
import { GroupMemberEntity } from "../member/group-member.entity";
import { RedisService } from "@shared";

/**群组服务 */
@Injectable()
export class GroupService {
  /**构造函数 */
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepo: Repository<GroupEntity>,
    @InjectRepository(GroupMemberEntity)
    private readonly memberRepo: Repository<GroupMemberEntity>,
    private readonly redisService: RedisService,
  ) {}

  /**获取用户的所有群组列表 */
  async listByUser(userId: number) {
    // 查询用户加入的所有群组
    const members = await this.memberRepo.find({
      where: { userId, isActive: true },
      relations: ["group"],
      order: { group: { update: { at: "DESC" } } },
    });
    return members.map((m) => m.group);
  }

  /**获取群组详情 */
  async getGroupDetail(groupId: number, userId: number) {
    // 检查用户是否在群组中
    const member = await this.memberRepo.findOne({
      where: { groupId, userId, isActive: true },
    });
    if (!member) {
      throw new ForbiddenException("您不在该群组中");
    }
    // 获取群组详情
    const group = await this.groupRepo.findOneBy({ id: groupId });
    return { group, role: member.role };
  }

  /**创建群组 */
  async createGroup(dto: CreateGroupDto, userId: number) {
    // 创建群组实体
    const group = this.groupRepo.create({
      name: dto.name,
      description: dto.description || "",
      avatar: dto.avatar || "",
      isPublic: dto.isPublic ?? false,
    });

    const savedGroup = await this.groupRepo.save(group);

    // 创建创建者为 owner 成员
    const member = this.memberRepo.create({
      groupId: savedGroup.id,
      userId,
      role: "owner",
      joinedAt: Date.now(),
    });
    await this.memberRepo.save(member);

    return savedGroup;
  }

  /**更新群组 */
  async updateGroup(groupId: number, dto: UpdateGroupDto, userId: number) {
    // 检查权限：只有 owner 和 admin 可以更新群组
    const member = await this.memberRepo.findOne({
      where: { groupId, userId, isActive: true },
    });
    if (!member || !["owner", "admin"].includes(member.role)) {
      throw new ForbiddenException("您没有权限编辑该群组");
    }

    const group = await this.groupRepo.findOneBy({ id: groupId });
    if (!group) {
      throw new UnprocessableEntityException("群组不存在");
    }

    // 更新字段
    if (dto.name !== undefined) group.name = dto.name;
    if (dto.description !== undefined) group.description = dto.description;
    if (dto.avatar !== undefined) group.avatar = dto.avatar;
    if (dto.isPublic !== undefined) group.isPublic = dto.isPublic;
    if (dto.status !== undefined) group.status = dto.status;

    group.update = {
      userId,
      at: Date.now(),
      operate: "update",
      operateId: 0,
      reqId: 0,
      updateLoad: () => {},
    };

    return this.groupRepo.save(group);
  }

  /**用户加入公开群组 */
  async joinGroup(groupId: number, userId: number) {
    const group = await this.groupRepo.findOneBy({ id: groupId });
    if (!group) {
      throw new UnprocessableEntityException("群组不存在");
    }
    if (!group.isPublic) {
      throw new ForbiddenException("该群组不允许公开加入");
    }

    // 检查是否已经在群中
    const existing = await this.memberRepo.findOne({
      where: { groupId, userId },
    });
    if (existing) {
      if (existing.isActive) {
        throw new UnprocessableEntityException("您已经在该群组中");
      }
      // 重新加入
      existing.isActive = true;
      existing.joinedAt = Date.now();
      return this.memberRepo.save(existing);
    }

    // 创建新成员
    const member = this.memberRepo.create({
      groupId,
      userId,
      role: "member",
      joinedAt: Date.now(),
    });
    return this.memberRepo.save(member);
  }

  /**用户退出群组 */
  async leaveGroup(groupId: number, userId: number) {
    const member = await this.memberRepo.findOne({
      where: { groupId, userId, isActive: true },
    });
    if (!member) {
      throw new UnprocessableEntityException("您不在该群组中");
    }

    // owner 不能退出，只能删除群组
    if (member.role === "owner") {
      throw new ForbiddenException("群组创建者不能退出，请删除群组");
    }

    member.isActive = false;
    await this.memberRepo.save(member);
    return { success: true };
  }

  /**获取群组成员列表 */
  async listMembers(groupId: number, userId: number) {
    // 检查用户是否在群组中
    const member = await this.memberRepo.findOne({
      where: { groupId, userId, isActive: true },
    });
    if (!member) {
      throw new ForbiddenException("您不在该群组中");
    }

    return this.memberRepo.find({
      where: { groupId, isActive: true },
      relations: ["user"],
      select: {
        id: true,
        role: true,
        joinedAt: true,
        user: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    });
  }
}
