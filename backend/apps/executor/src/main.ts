// 外部依赖
import { NestFactory } from "@nestjs/core";
// 内部依赖
import { ExecutorModule } from "./executor.module";

async function bootstrap() {
  const app = await NestFactory.create(ExecutorModule);
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
