// 外部依赖
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
// 内部依赖
import { OperateService, OptionService, QueueService } from "@shared";
import { CategoryEntity, CategoryLogEntity } from "..";

/**分组服务 */
@Injectable()
export class CategoryService extends OptionService<
  CategoryEntity,
  CategoryLogEntity
> {
  /**
   * 构造函数
   * @param operateSrv 操作序号服务
   * @param queueSrv 队列服务
   * @param categoryRepository 分组存储器
   * @param categoryLogRepository 分组日志存储器
   */
  constructor(
    operateSrv: OperateService,
    queueSrv: QueueService,
    @InjectRepository(CategoryEntity)
    protected readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(CategoryLogEntity)
    protected readonly categoryLogRepository: Repository<CategoryLogEntity>,
  ) {
    super(
      "id",
      "category",
      operateSrv,
      queueSrv,
      categoryRepository,
      categoryLogRepository,
    );
  }
}
