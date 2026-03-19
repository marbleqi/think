// 外部依赖
import { NestFactory } from "@nestjs/core";
// 内部依赖
import { CoordinatorModule } from "./coordinator.module";

async function bootstrap() {
  const app = await NestFactory.create(CoordinatorModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
