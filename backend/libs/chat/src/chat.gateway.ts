// 外部依赖
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
// 内部依赖
import { UserEntity } from "@auth";
import { MessageEntity } from "./message/message.entity";
import { SendMessageDto } from "./message/message.dto";
import { MessageService } from "./message/message.service";
import { GroupMemberEntity } from "./member/group-member.entity";

/**聊天 WebSocket Gateway */
@WebSocketGateway({
  cors: {
    origin: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /**Server 实例 */
  @WebSocketServer()
  server: Server;

  /**在线用户 socket 映射: userId -> Set<socket> */
  private userSockets = new Map<number, Set<Socket>>();

  /**用户当前所在群组: socket.id -> groupId */
  private socketCurrentGroup = new Map<string, number>();

  /**构造函数 */
  constructor(
    private readonly messageService: MessageService,
    @InjectRepository(GroupMemberEntity)
    private readonly memberRepo: Repository<GroupMemberEntity>,
  ) {}

  /**连接建立 */
  handleConnection(client: Socket) {
    // TODO: 这里需要从 handshake 中获取认证用户信息
    // 暂时简单处理，客户端需要传 userId 在 query 中
    const userId = client.handshake.query.userId
      ? parseInt(client.handshake.query.userId as string, 10)
      : 0;
    if (userId > 0) {
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client);
      client.data.userId = userId;
    }
  }

  /**连接断开 */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.socketCurrentGroup.delete(client.id);
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  /**用户加入某个群组的消息订阅 */
  @SubscribeMessage("joinGroup")
  handleJoinGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    this.socketCurrentGroup.set(client.id, data.groupId);
    // 加入 socket room
    client.join(`group:${data.groupId}`);
  }

  /**用户离开群组消息订阅 */
  @SubscribeMessage("leaveGroup")
  handleLeaveGroup(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: number },
  ) {
    this.socketCurrentGroup.delete(client.id);
    client.leave(`group:${data.groupId}`);
  }

  /**发送消息 */
  @SubscribeMessage("sendMessage")
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return;
    }

    const message = await this.messageService.sendMessage(data, userId);

    // 加载发送者信息
    const fullMessage = await this.messageRepo.findOne({
      where: { id: message.id },
      relations: ["sender"],
      select: {
        sender: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    });

    // 广播给群组内所有在线用户
    this.server.to(`group:${data.groupId}`).emit("newMessage", fullMessage);
  }

  /**广播新消息给群组内所有成员（供 REST API 也能触发广播） */
  broadcastNewMessage(message: MessageEntity) {
    this.server.to(`group:${message.groupId}`).emit("newMessage", message);
  }

  /**获取消息仓库 */
  private get messageRepo() {
    return this.messageService["messageRepo"];
  }
}
