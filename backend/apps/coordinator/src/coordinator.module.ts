// 外部依赖
import { Module } from "@nestjs/common";
// 内部依赖
import { CoordinatorController } from "./coordinator.controller";
import { CoordinatorService } from "./coordinator.service";

@Module({
  imports: [],
  controllers: [CoordinatorController],
  providers: [CoordinatorService],
})
export class CoordinatorModule {}
