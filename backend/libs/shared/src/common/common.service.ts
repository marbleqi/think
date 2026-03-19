// 外部依赖
import {
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Repository, ObjectLiteral, FindOptionsWhere, MoreThan } from "typeorm";
// 内部依赖
import {
  CreateEntity,
  UpdateEntity,
  LogEntity,
  OperateService,
  QueueService,
} from "@shared";

/**通用对象实体 */
export type CommonEntity = ObjectLiteral & {
  /**对象ID */
  id: number;
  /**创建信息 */
  create?: CreateEntity;
  /**更新信息 */
  update: UpdateEntity;
};

/**通用对象日志实体 */
export type CommonEntityLog = ObjectLiteral & {
  /**日志信息 */
  log: LogEntity;
  /**对象ID */
  id: number;
  /**创建信息 */
  create?: CreateEntity;
  /**更新信息 */
  update: UpdateEntity;
};

/**
 * 通用对象服务
 * @template Entity - 通用对象实体
 * @template EntityLog - 通用对象日志实体
 */
export abstract class CommonService<
  Entity extends CommonEntity,
  EntityLog extends CommonEntityLog,
> {
  /**对象名称 */
  name: string;
  /**
   * 构造函数
   * @param name 对象名称
   * @param operateSrv 操作记录服务
   * @param queueSrv 队列服务
   * @param commonRepository 对象存储器
   * @param commonLogRepository 对象日志存储器
   */
  constructor(
    name: string,
    protected readonly operateSrv: OperateService,
    protected readonly queueSrv: QueueService,
    protected readonly commonRepository: Repository<Entity>,
    protected readonly commonLogRepository: Repository<EntityLog>,
  ) {
    this.name = name;
  }

  /**
   * 根据操作ID追加日志
   * @param operateId 操作ID
   */
  protected addLog(operateId: number): void {
    this.queueSrv.addTask(async () => {
      /**待追加日志的对象记录 */
      const commons: Entity[] = await this.commonRepository.findBy({
        update: { operateId },
      } as FindOptionsWhere<Entity>);
      if (commons.length) {
        // 追加日志
        await this.commonLogRepository.insert(
          commons as unknown as EntityLog[],
        );
      }
    });
  }

  /**
   * 获取对象清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 对象清单
   */
  async index(operateId: number = -1) {
    return this.commonRepository.findBy({
      update: {
        operateId: MoreThan(operateId),
      },
    } as FindOptionsWhere<Entity>);
  }

  /**
   * 获取对象记录数
   * @returns 记录数
   */
  async count() {
    return this.commonRepository.count();
  }

  /**
   * 获取对象详情
   * @param id 对象ID
   * @returns 对象详情
   */
  async show(id: number) {
    return this.commonRepository.findOneBy({
      id,
    } as FindOptionsWhere<Entity>);
  }

  /**
   * 获取对象变更日志
   * @param id 对象ID
   * @returns 对象变更记录
   */
  async log(id: number) {
    return this.commonLogRepository.findBy({
      id,
    } as FindOptionsWhere<EntityLog>);
  }

  /**
   * 创建对象
   * @param value 对象创建信息
   * @param userId 操作用户ID
   * @param reqId 请求日志ID
   * @returns 新对象主键ID，如果创建失败则抛出异常
   */
  async create(value: Partial<Entity>, userId: number = 0, reqId: number = 0) {
    /**创建操作序号 */
    const operateId = await this.operateSrv.create(this.name, "create", userId);

    /**创建对象结果 */
    const result = await this.commonRepository.insert({
      ...value,
      id: undefined,
      create: { userId, at: Date.now() },
      update: { userId, operate: "create", operateId, reqId, at: Date.now() },
    });
    if (result.identifiers.length) {
      // 追加日志
      this.addLog(operateId);
      return Number(result.identifiers[0].id);
    }
    throw new UnprocessableEntityException(`对象创建失败！`);
  }

  /**
   * 更新对象
   * @param id 对象ID
   * @param value 对象更新信息
   * @param userId 操作用户ID
   * @param reqId 请求日志ID
   * @returns 对象ID，如果更新失败则抛出异常
   */
  async update(
    id: number,
    value: Partial<Entity>,
    userId: number = 0,
    reqId: number = 0,
  ) {
    /**对象存在标记 */
    const exist = await this.commonRepository.existsBy({
      id,
    } as unknown as FindOptionsWhere<Entity>);
    if (!exist) {
      throw new NotFoundException(`当前对象不存在！`);
    }

    /**创建操作序号 */
    const operateId = await this.operateSrv.create(this.name, "update", userId);

    /**更新对象结果 */
    const result = await this.commonRepository.update(id, {
      ...value,
      update: { userId, operate: "update", operateId, reqId, at: Date.now() },
    });
    if (result.affected) {
      // 追加日志
      this.addLog(operateId);
      return id;
    }
    throw new UnprocessableEntityException(`更新对象信息失败！`);
  }
}
