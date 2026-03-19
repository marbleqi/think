// 外部依赖
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
// 内部依赖
import {
  OperateEntity,
  ReqEntity,
  SettingEntity,
  SettingLogEntity,
  RedisService,
  OperateService,
  EmailService,
  ReqService,
  SettingService,
  QueueService,
} from "@shared";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OperateEntity,
      ReqEntity,
      SettingEntity,
      SettingLogEntity,
    ]),
  ],
  providers: [
    RedisService,
    OperateService,
    EmailService,
    ReqService,
    SettingService,
    QueueService,
  ],
  exports: [
    RedisService,
    OperateService,
    EmailService,
    ReqService,
    SettingService,
    QueueService,
  ],
})
export class SharedModule {}
