// 外部依赖
import { Controller } from "@nestjs/common";
// 内部依赖
import { Allow, CategoryService, OptionController } from "@auth";
import { CategoryUpdateDto } from "..";

@Controller("admin/category")
@Allow("admin")
export class CategoryController extends OptionController<
  CategoryService,
  CategoryUpdateDto
> {
  /**
   * 构造函数
   * @param categorySrv 产品服务
   */
  constructor(readonly categorySrv: CategoryService) {
    super(categorySrv);
  }
}
