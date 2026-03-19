// 外部依赖
import { Injectable, UnauthorizedException } from "@nestjs/common";
// 内部依赖
import { random, RedisService } from "@shared";

/**
 * 令牌服务
 *
 * 令牌属于经常被使用，而且修改频繁的对象
 * 后端采用Redis存储的方式（以支持多后端实例同时运行的情况）
 */
@Injectable()
export class TokenService {
  /**
   * 构造函数
   * @param redisSrv 共享缓存服务
   */
  constructor(private readonly redisSrv: RedisService) {}

  /**
   * 获取令牌清单
   * @returns 令牌清单
   */
  async index() {
    /**令牌清单 */
    const tokens = await this.redisSrv.keys("token:*");
    /**令牌数组 */
    const result: Record<string, string>[] = [];
    for (const item of tokens) {
      /**令牌 */
      const token = await this.redisSrv.hgetall(item);
      result.push(token);
    }
    return result;
  }

  /**
   * 获取令牌数量
   * @returns 令牌数量
   */
  async count() {
    /**令牌清单 */
    const tokens = await this.redisSrv.keys("token:*");
    return tokens.length;
  }

  /**
   * 获取令牌详情
   * @param token 令牌
   * @returns 令牌详情
   */
  async show(token: string) {
    return this.redisSrv.hgetall(`token:${token}`);
  }

  /**
   * 刷新令牌，旧令牌换新令牌
   * @param id 待换令牌的用户ID
   * @param oldToken 原令牌
   * @param valid 有效期（单位：分钟）
   * @returns 新令牌信息
   */
  async refresh(id: number, oldToken: string, valid: number) {
    /**过期时间 */
    const expired = Date.now() + valid * 60000;
    // 重新令牌过期时间
    /**执行结果 */
    let result: number = await this.redisSrv.pexpireat(
      `token:${oldToken}`,
      expired,
    );
    // 令牌过期时间更新失败
    if (!result) {
      throw new UnauthorizedException(`刷新令牌过期时间失败！`);
    }
    /**新令牌 */
    let newToken: string;
    /**新令牌存在标记 */
    let exists: number;
    do {
      newToken = random(60);
      exists = await this.redisSrv.exists(`token:${id}:${newToken}`);
    } while (exists);
    /**更换令牌键值 */
    result = await this.redisSrv.renamenx(
      `token:${oldToken}`,
      `token:${id}:${newToken}`,
    );
    // 令牌更新失败
    if (!result) {
      throw new UnauthorizedException(`令牌更新失败`);
    }
    // 更新缓存部分字段
    await this.redisSrv.hmset(
      `token:${id}:${newToken}`,
      "code",
      newToken,
      "valid",
      valid,
      "expired",
      expired,
      "updateAt",
      Date.now(),
    );
    // 返回新的令牌信息
    return this.redisSrv.hgetall(`token:${id}:${newToken}`);
  }

  /**
   * 令牌作废
   * @param token 待作废的令牌
   * @returns 响应报文
   */
  async destroy(token: string) {
    return this.redisSrv.del(`token:${token}`);
  }
}
