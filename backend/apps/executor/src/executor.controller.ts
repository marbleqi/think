// 外部依赖
import { Controller, Get } from "@nestjs/common";
// 内部依赖
import { ExecutorService } from "./executor.service";

@Controller()
export class ExecutorController {
  constructor(private readonly executorService: ExecutorService) {}

  @Get()
  getHello(): string {
    return this.executorService.getHello();
  }
}
