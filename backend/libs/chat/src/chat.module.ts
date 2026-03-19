// 外部依赖
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
// 内部依赖
import { SharedModule } from "@shared";
import { AuthModule } from "@auth";
import { GroupEntity } from "./group/group.entity";
import { GroupMemberEntity } from "./member/group-member.entity";
import { MessageEntity } from "./message/message.entity";
import { GroupService } from "./group/group.service";
import { MessageService } from "./message/message.service";
import { ChatGateway } from "./chat.gateway";
import { ChatController } from "./chat.controller";

/**聊天模块 */
@Module({
  imports: [
    SharedModule,
    AuthModule,
    TypeOrmModule.forFeature([GroupEntity, GroupMemberEntity, MessageEntity]),
  ],
  providers: [GroupService, MessageService, ChatGateway],
  controllers: [ChatController],
  exports: [],
})
export class ChatModule {}
