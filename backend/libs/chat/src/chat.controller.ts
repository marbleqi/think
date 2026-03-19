// 外部依赖
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
// 内部依赖
import { GroupService } from "./group/group.service";
import { MessageService } from "./message/message.service";
import { CreateGroupDto, UpdateGroupDto } from "./group/group.dto";
import { SendMessageDto, GetMessagesDto } from "./message/message.dto";
import { ChatGateway } from "./chat.gateway";

/**聊天控制器 */
@Controller("chat")
export class ChatController {
  /**构造函数 */
  constructor(
    private readonly groupService: GroupService,
    private readonly messageService: MessageService,
    private readonly gateway: ChatGateway,
  ) {}

  /**获取当前用户的群组列表 */
  @Get("groups")
  async listGroups(@Req() req: any) {
    const userId = req.user.id;
    return this.groupService.listByUser(userId);
  }

  /**获取群组详情 */
  @Get("groups/:id")
  async getGroup(@Param("id") id: string, @Req() req: any) {
    const groupId = parseInt(id, 10);
    const userId = req.user.id;
    return this.groupService.getGroupDetail(groupId, userId);
  }

  /**创建群组 */
  @Post("groups")
  @HttpCode(HttpStatus.CREATED)
  async createGroup(@Body() dto: CreateGroupDto, @Req() req: any) {
    const userId = req.user.id;
    return this.groupService.createGroup(dto, userId);
  }

  /**更新群组 */
  @Patch("groups/:id")
  async updateGroup(
    @Param("id") id: string,
    @Body() dto: UpdateGroupDto,
    @Req() req: any,
  ) {
    const groupId = parseInt(id, 10);
    const userId = req.user.id;
    return this.groupService.updateGroup(groupId, dto, userId);
  }

  /**加入公开群组 */
  @Post("groups/:id/join")
  @HttpCode(HttpStatus.OK)
  async joinGroup(@Param("id") id: string, @Req() req: any) {
    const groupId = parseInt(id, 10);
    const userId = req.user.id;
    return this.groupService.joinGroup(groupId, userId);
  }

  /**退出群组 */
  @Post("groups/:id/leave")
  @HttpCode(HttpStatus.OK)
  async leaveGroup(@Param("id") id: string, @Req() req: any) {
    const groupId = parseInt(id, 10);
    const userId = req.user.id;
    return this.groupService.leaveGroup(groupId, userId);
  }

  /**获取群组成员列表 */
  @Get("groups/:id/members")
  async listMembers(@Param("id") id: string, @Req() req: any) {
    const groupId = parseInt(id, 10);
    const userId = req.user.id;
    return this.groupService.listMembers(groupId, userId);
  }

  /**获取消息历史 */
  @Post("messages")
  @HttpCode(HttpStatus.OK)
  async getMessages(@Body() dto: GetMessagesDto, @Req() req: any) {
    const userId = req.user.id;
    return this.messageService.getMessages(dto, userId);
  }

  /**发送消息（REST 接口方式，WebSocket 优先） */
  @Post("messages/send")
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(@Body() dto: SendMessageDto, @Req() req: any) {
    const userId = req.user.id;
    const message = await this.messageService.sendMessage(dto, userId);
    // 广播给群内用户
    this.gateway.broadcastNewMessage(message);
    return message;
  }
}
