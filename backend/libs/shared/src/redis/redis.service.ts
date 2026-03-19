// 外部依赖
import { Injectable } from "@nestjs/common";
import { Redis, RedisOptions } from "ioredis";
// 内部依赖
import { random } from "@shared";

/**随机码缓存记录 */
export interface Code {
  /**其他预留字段 */
  [key: string]: any;

  /**随机码 */
  code: string;

  /**类型 */
  type?: string;

  /**创建时间 */
  createAt: number;

  /**更新时间 */
  updateAt: number;

  /**过期时间 */
  expired: number;
}

/**缓存服务（Redis） */
@Injectable()
export class RedisService extends Redis {
  /**构造函数 */
  constructor() {
    // 进行配置参数验证
    if (!process.env.REDIS_HOST) {
      throw new Error("未配置缓存地址");
    }
    /**缓存地址 */
    const host = process.env.REDIS_HOST;
    /**缓存端口 */
    const port = process.env.REDIS_PORT
      ? parseInt(process.env.REDIS_PORT, 10)
      : 6379;
    /**缓存数据库 */
    const db = 0;
    /**缓存密码 */
    const password = process.env.REDIS_PSW || "";
    /**缓存配置 */
    const options = { host, port, db, password } as RedisOptions;
    console.debug("应用缓存已连接");
    super(options);
  }

  /**
   * 创建随机码缓存记录
   * @param prefix 随机码前缀
   * @param length 随机码长度
   * @param valid 有效期（单位：分钟），注：默认为0，表示永久有效
   * @param cache 附加信息
   */
  async addCode(
    prefix: string,
    length: number = 60,
    valid: number = 0,
    cache: object = {},
  ) {
    /**随机码 */
    let code: string;
    /**随机码已存在标记 */
    let exists: number;
    // 生成新的随机码，且确保该随机码不重复
    do {
      code = random(length);
      exists = await this.exists(`${prefix}:${code}`);
    } while (exists);
    const result: Code = {
      ...cache,
      code,
      expired: Date.now() + valid * 60000,
      createAt: Date.now(),
      updateAt: Date.now(),
    };
    // 缓存随机码
    await this.hmset(`${prefix}:${code}`, result);
    if (valid) {
      // 设置随机码有效期
      await this.pexpireat(`${prefix}:${code}`, result.expired);
    }
    // 返回随机码信息
    return result;
  }
}
