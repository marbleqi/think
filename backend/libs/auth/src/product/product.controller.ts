// 外部依赖
import { Controller, Get, Query } from "@nestjs/common";
// 内部依赖
import { OperatePipe } from "@shared";
import { ProductService } from "..";

/**产品控制器 */
@Controller("product")
export class ProductController {
  constructor(private readonly productSrv: ProductService) {}

  /**
   * 获取产品清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 对象清单
   */
  @Get()
  index(@Query("operateId", OperatePipe) operateId: number) {
    return this.productSrv.index(operateId);
  }
}
