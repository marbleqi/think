// 外部依赖
import { Controller, Get, Query } from "@nestjs/common";
// 内部依赖
import { OperatePipe } from "@shared";
import { CategoryService } from "..";

/**分组控制器 */
@Controller("category")
export class CategoryController {
  constructor(private readonly categorySrv: CategoryService) {}

  /**
   * 获取分组清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 对象清单
   */
  @Get()
  index(@Query("operateId", OperatePipe) operateId: number) {
    return this.categorySrv.index(operateId);
  }
}
