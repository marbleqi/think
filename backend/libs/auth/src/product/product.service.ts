// 外部依赖
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
// 内部依赖
import { OperateService, OptionService, QueueService } from "@shared";
import { ProductEntity, ProductLogEntity } from "..";

/**产品服务 */
@Injectable()
export class ProductService extends OptionService<
  ProductEntity,
  ProductLogEntity
> {
  /**
   * 构造函数
   * @param operateSrv 操作序号服务
   * @param queueSrv 队列服务
   * @param productRepository 产品存储器
   * @param productLogRepository 产品日志存储器
   */
  constructor(
    operateSrv: OperateService,
    queueSrv: QueueService,
    @InjectRepository(ProductEntity)
    protected readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(ProductLogEntity)
    protected readonly productLogRepository: Repository<ProductLogEntity>,
  ) {
    super(
      "id",
      "product",
      operateSrv,
      queueSrv,
      productRepository,
      productLogRepository,
    );
  }
}
