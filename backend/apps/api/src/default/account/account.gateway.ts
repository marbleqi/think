/* eslint-disable @typescript-eslint/no-misused-promises */
// 外部依赖
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Socket, Namespace } from "socket.io";

// 内部依赖
import { UserService } from "@auth";

/**登录授权网关 */
@WebSocketGateway({ namespace: "account", cors: { origin: true } })
export class AccountGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly userSrv: UserService) {}

  /**
   * WebSocket初始化处理
   * @param namespace 绑定命名空间
   */
  afterInit(namespace: Namespace) {
    this.userSrv.result.subscribe(async (data) => {
      console.debug("收到订阅消息", data);
      const id = Number(data.id);
      const valid = Number(data.valid);
      const token = await this.userSrv.token(id, valid);
      namespace.to(data.room).emit("token", token);
    });
  }

  /**
   * WebSocket有连接接入时处理
   * @param client 客户端对象
   */
  handleConnection(client: Socket, ...args: any[]) {
    console.debug("有请求接入", client.id, args);
  }

  /**
   * WebSocket有连接断开时处理
   * @param client 客户端对象
   */
  handleDisconnect(client: Socket) {
    console.debug("有请求断开", client.id);
  }

  /**
   * 登录消息
   * @param client 客户端对象
   * @param payload 消息负载
   */
  @SubscribeMessage("login")
  async handleMessage(client: Socket, email: string) {
    console.debug("收到登录消息：", client.id, email);
    // 发送授权邮件
    const result = await this.userSrv.send(email, client.id);
    client.emit("email", result);
  }
}
