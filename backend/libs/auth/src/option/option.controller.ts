// 外部依赖
import { Get, Post, Query, Param, Body } from "@nestjs/common";
import type { Request } from "express";
// 内部依赖
import type { OptionEntity, OptionEntityLog } from "@shared";
import { OptionService, OperatePipe, ReqId } from "@shared";
import { UserId } from "@auth";

/**
 * 通用配置对象控制器
 * @template Service - 配置对象服务类型
 * @template UpdateDto - 更新配置DTO类型
 */
export abstract class OptionController<
  Service extends OptionService<OptionEntity, OptionEntityLog>,
  UpdateDto extends Partial<OptionEntity>,
> {
  /**
   * 构造函数
   * @param optionSrv 配置对象服务
   */
  constructor(readonly optionSrv: Service) {}

  /**
   * 获取对象清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 对象清单
   */
  @Get("index")
  index(@Query("operateId", OperatePipe) operateId: number) {
    return this.optionSrv.index(operateId);
  }

  /**
   * 获取对象详情
   * @param key 对象键值
   * @returns 对象详情
   */
  @Get("show/:key")
  show(@Param("key") key: string) {
    return this.optionSrv.show(key);
  }

  /**
   * 获取对象变更日志
   * @param key 对象键值
   * @returns 对象变更记录
   */
  @Get("log/:key")
  log(@Param("key") key: string) {
    return this.optionSrv.log(key);
  }

  /**
   * 更新对象（含禁用）
   * @param value 提交消息体
   * @param req 请求对象
   * @returns 对象主键值
   */
  @Post("update")
  async update(
    @Body() value: UpdateDto,
    @UserId() userId: number,
    @ReqId() reqId: number,
  ) {
    return this.optionSrv.update(value, userId, reqId);
  }
}
