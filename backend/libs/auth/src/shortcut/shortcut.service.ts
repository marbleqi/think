// 外部依赖
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere } from "typeorm";
// 内部依赖
import { ShortcutEntity } from "..";

/**快捷方式服务 */
@Injectable()
export class ShortcutService {
  /**
   * 构造函数
   * @param shortcutRepository 快捷方式存储器
   */
  constructor(
    @InjectRepository(ShortcutEntity)
    protected readonly shortcutRepository: Repository<ShortcutEntity>,
  ) {}

  /**
   * 获取快捷方式详情
   * @param id 对象ID
   * @returns 对象详情
   */
  async show(id: number) {
    return this.shortcutRepository.findOneBy({
      id,
    } as FindOptionsWhere<ShortcutEntity>);
  }

  /**
   * 更新快捷方式
   * @param value 对象更新信息
   * @returns 更新结果，1为成功，0为失败
   */
  async update(value: Partial<ShortcutEntity>) {
    try {
      await this.shortcutRepository.save(value);
      return 1;
    } catch {
      console.debug("更新快捷方式失败");
      return 0;
    }
  }
}
