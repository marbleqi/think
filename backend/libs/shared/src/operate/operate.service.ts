// 外部依赖
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, Between } from "typeorm";
// 内部依赖
import { OperateEntity } from "@shared";

/**操作序号服务 */
@Injectable()
export class OperateService {
  /**
   * 构造函数
   * @param operateRepository 操作序号存储器
   */
  constructor(
    @InjectRepository(OperateEntity)
    private readonly operateRepository: Repository<OperateEntity>,
  ) {}

  /**
   * 获取操作记录
   * @param start 起始时间
   * @param end 结束之间
   * @returns 操作序号清单
   */
  async index(start: number, end: number) {
    return this.operateRepository.findBy({
      at: Between(start, end),
    } as FindOptionsWhere<OperateEntity>);
  }

  /**
   * 获取操作详情
   * @param id 操作序号ID
   * @returns 操作序号详情
   */
  async show(id: number) {
    return this.operateRepository.findOneBy({
      id,
    } as FindOptionsWhere<OperateEntity>);
  }

  /**
   * 获取新的操作序号
   * @param name 操作对象
   * @param operate 操作类型
   * @param userId 操作用户ID
   * @param remark 操作备注
   * @returns 新的操作序号
   */
  async create(
    name: string,
    operate: string,
    userId: number = 0,
    remark: string = "",
  ) {
    const result = await this.operateRepository.insert({
      name,
      operate,
      userId,
      remark,
      at: Date.now(),
    });
    if (result.identifiers.length) {
      return Number(result.identifiers[0].id);
    }
    return 0;
  }
}
