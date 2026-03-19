// 外部依赖
import { Controller } from "@nestjs/common";
// 内部依赖
import { Allow, ProductService, OptionController } from "@auth";
import { ProductUpdateDto } from "..";

@Controller("admin/product")
@Allow("admin")
export class ProductController extends OptionController<
  ProductService,
  ProductUpdateDto
> {
  /**
   * 构造函数
   * @param productSrv 产品服务
   */
  constructor(readonly productSrv: ProductService) {
    super(productSrv);
  }
}
