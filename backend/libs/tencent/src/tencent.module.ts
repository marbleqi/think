// 外部依赖
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
// 内部依赖
import { CloudModule } from "@cloud";
import { ApiService, TencentService } from ".";

@Module({
  imports: [HttpModule, CloudModule],
  providers: [ApiService, TencentService],
  exports: [TencentService],
})
export class TencentModule {}
