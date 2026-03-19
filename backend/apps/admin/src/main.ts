// 外部依赖
import { NestFactory } from "@nestjs/core";
import { json } from "body-parser";

// 内部依赖
import { AdminModule } from "./admin.module";

/**项目启动函数 */
async function bootstrap() {
  /**应用 */
  const app = await NestFactory.create(AdminModule);
  // 开启全局跨域许可
  app.enableCors({ origin: true });
  // 激活终止信号侦听器
  app.enableShutdownHooks();
  // 设置JSON解析器的限制
  app.use(json({ limit: 1073741824 }));
  await app.listen(process.env.PORT || 3000);
}
void bootstrap();
