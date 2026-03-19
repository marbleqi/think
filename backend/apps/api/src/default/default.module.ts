// 外部依赖
import { Module } from "@nestjs/common";
// 内部依赖
import { SharedModule } from "@shared";
import { AuthModule } from "@auth";
import { AccountGateway, AccountController, UserController } from "@default";

@Module({
  imports: [SharedModule, AuthModule],
  providers: [AccountGateway],
  controllers: [AccountController, UserController],
})
export class DefaultModule {}
