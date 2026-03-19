// 外部依赖
import { Injectable } from "@nestjs/common";

@Injectable()
export class CoordinatorService {
  getHello(): string {
    return "Hello World!";
  }
}
