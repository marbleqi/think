// 外部依赖
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
// 内部依赖
import { SharedModule } from "@shared";
import { KeyEntity, KeyLogEntity, KeyService } from "./key";

/**云服务模块 */
@Module({
  imports: [TypeOrmModule.forFeature([KeyEntity, KeyLogEntity]), SharedModule],
  providers: [KeyService],
  exports: [KeyService],
})
export class CloudModule {}
