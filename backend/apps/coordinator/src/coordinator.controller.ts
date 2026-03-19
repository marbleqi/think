// 外部依赖
import { Controller, Get } from "@nestjs/common";
// 内部依赖
import { CoordinatorService } from "./coordinator.service";

@Controller()
export class CoordinatorController {
  constructor(private readonly coordinatorService: CoordinatorService) {}

  @Get()
  getHello(): string {
    return this.coordinatorService.getHello();
  }
}
