// 外部依赖
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
// 内部依赖
import { SharedModule } from "@shared";
import { KongEntity, KongLogEntity, KongService, ObjectService } from ".";

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([KongEntity, KongLogEntity]),
    SharedModule,
  ],
  providers: [KongService, ObjectService],
  exports: [KongService, ObjectService],
})
export class KongModule {}
