// 外部依赖
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOptionsSelect,
  FindOptionsWhere,
  MoreThan,
} from "typeorm";
// 内部依赖
import { CommonService, OperateService, QueueService } from "@shared";
import { KeyEntity, KeyLogEntity } from ".";

@Injectable()
export class KeyService extends CommonService<KeyEntity, KeyLogEntity> {
  /**
   * 构造函数
   * @param operateSrv 操作序号服务
   * @param queueSrv 队列服务
   * @param keyRepository 密钥存储器
   * @param keyLogRepository 密钥日志存储器
   */
  constructor(
    protected readonly operateSrv: OperateService,
    protected readonly queueSrv: QueueService,
    @InjectRepository(KeyEntity)
    protected readonly keyRepository: Repository<KeyEntity>,
    @InjectRepository(KeyLogEntity)
    protected readonly keyLogRepository: Repository<KeyLogEntity>,
  ) {
    super("key", operateSrv, queueSrv, keyRepository, keyLogRepository);
  }

  index(operateId: number = -1) {
    return this.keyRepository.find({
      select: [
        "id",
        "name",
        "description",
        "provider",
        "key",
        "status",
        "create.userId",
        "create.at",
        "update.userId",
        "update.at",
        "update.operateId",
        "update.operate",
        "update.reqId",
      ] as FindOptionsSelect<KeyEntity>,
      where: {
        update: {
          operateId: MoreThan(operateId),
        },
      } as FindOptionsWhere<KeyEntity>,
    });
  }
}
