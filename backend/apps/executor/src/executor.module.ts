// 外部依赖
import { Module } from "@nestjs/common";
// 内部依赖
import { ExecutorController } from "./executor.controller";
import { ExecutorService } from "./executor.service";

@Module({
  imports: [],
  controllers: [ExecutorController],
  providers: [ExecutorService],
})
export class ExecutorModule {}
