// 外部依赖
import { UnprocessableEntityException } from "@nestjs/common";
import { Repository, ObjectLiteral, FindOptionsWhere, MoreThan } from "typeorm";

// 内部依赖
import {
  CreateEntity,
  UpdateEntity,
  LogEntity,
  OperateService,
  QueueService,
} from "@shared";

/**配置对象实体 */
export type OptionEntity = ObjectLiteral & {
  /**创建信息 */
  create?: CreateEntity;
  /**更新信息 */
  update: UpdateEntity;
};

/**配置对象日志实体 */
export type OptionEntityLog = ObjectLiteral & {
  /**日志信息 */
  log: LogEntity;
  /**创建信息 */
  create?: CreateEntity;
  /**更新信息 */
  update: UpdateEntity;
};

/**
 * 配置对象基础服务
 * @template Entity - 配置对象实体
 * @template EntityLog - 配置对象日志实体
 */
export abstract class OptionService<
  Entity extends OptionEntity,
  EntityLog extends OptionEntityLog,
> {
  /**主键字段名 */
  private readonly keyName: string;
  /**对象名称 */
  name: string;

  /**
   * 构造函数
   * @param keyName 主键名
   * @param name 对象名称
   * @param operateSrv 操作记录服务
   * @param queueSrv 队列服务
   * @param optionRepository 对象存储器
   * @param optionLogRepository 对象日志存储器
   */
  protected constructor(
    keyName: string,
    name: string,
    protected readonly operateSrv: OperateService,
    protected readonly queueSrv: QueueService,
    protected readonly optionRepository: Repository<Entity>,
    protected readonly optionLogRepository: Repository<EntityLog>,
  ) {
    this.keyName = keyName;
    this.name = name;
  }

  /**
   * 根据操作ID追加日志
   * @param operateId 操作ID
   */
  protected addLog(operateId: number): void {
    this.queueSrv.addTask(async () => {
      /**待追加日志的对象记录 */
      const options: Entity[] = await this.optionRepository.findBy({
        update: { operateId },
      } as FindOptionsWhere<Entity>);
      if (options.length) {
        // 追加日志
        await this.optionLogRepository.insert(
          options as unknown as EntityLog[],
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
    return this.optionRepository.findBy({
      update: {
        operateId: MoreThan(operateId),
      },
    } as FindOptionsWhere<Entity>);
  }

  /**
   * 获取对象详情
   * @param key 主键值
   * @returns 对象详情
   */
  async show(key: string) {
    return this.optionRepository.findOneBy({
      [this.keyName]: key,
    } as FindOptionsWhere<Entity>);
  }

  /**
   * 获取对象变更日志
   * @param key 主键值
   * @returns 对象变更记录
   */
  async log(key: string) {
    return this.optionLogRepository.findBy({
      [this.keyName]: key,
    } as FindOptionsWhere<EntityLog>);
  }

  /**
   * 更新或创建对象
   * @param value 对象信息
   * @param userId 操作用户ID
   * @param reqId 请求日志ID
   * @returns 对象主键值
   */
  async update(value: Partial<Entity>, userId: number = 0, reqId: number = 0) {
    /**对象存在标记 */
    const exist = await this.optionRepository.existsBy({
      [this.keyName]: value[this.keyName] as string,
    } as FindOptionsWhere<Entity>);
    // 如果键值已存在，则执行更新操作
    if (exist) {
      /**更新操作序号 */
      const operateId = await this.operateSrv.create(
        this.name,
        "update",
        userId,
      );
      /**更新对象结果 */
      const result = await this.optionRepository.update(
        {
          [this.keyName]: value[this.keyName] as string,
        } as FindOptionsWhere<Entity>,
        {
          ...value,
          update: {
            userId,
            operate: "update",
            operateId,
            reqId,
            at: Date.now(),
          },
        },
      );
      if (result.affected) {
        // 异步追加日志
        this.addLog(operateId);
        return {
          [this.keyName]: value[this.keyName] as string,
        };
      }
      throw new UnprocessableEntityException(`更新对象信息失败！`);
    }
    // 如果键值不存在，则执行插入操作
    else {
      /**创建操作序号 */
      const operateId = await this.operateSrv.create(
        this.name,
        "create",
        userId,
      );
      /**创建对象结果 */
      const result = await this.optionRepository.insert({
        ...value,
        create: { userId, at: Date.now() },
        update: {
          userId,
          operate: "create",
          operateId,
          reqId,
          at: Date.now(),
        },
      });
      if (result.identifiers.length) {
        // 追加日志
        this.addLog(operateId);
        return {
          [this.keyName]: value[this.keyName] as string,
        };
      }
      throw new UnprocessableEntityException(`对象创建失败！`);
    }
  }
}
