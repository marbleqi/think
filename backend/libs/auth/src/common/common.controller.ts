// 外部依赖
import {
  NotFoundException,
  SetMetadata,
  Get,
  Post,
  Query,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
import type { Request } from "express";
// 内部依赖
import type { CommonEntity, CommonEntityLog } from "@shared";
import { CommonService, OperatePipe, ReqId } from "@shared";
import { UserId } from "@auth";

/**授权角色装饰器 */
export const Allow = (role: string) => SetMetadata("role", role);

/**
 * 通用对象控制器
 * @template Service - 通用对象服务类型
 * @template CreateDto - 创建对象DTO类型
 * @template UpdateDto - 更新对象DTO类型
 */
export abstract class CommonController<
  Service extends CommonService<CommonEntity, CommonEntityLog>,
  CreateDto extends Partial<CommonEntity>,
  UpdateDto extends Partial<CommonEntity>,
> {
  /**
   * 构造函数
   * @param commonSrv 对象服务
   */
  constructor(readonly commonSrv: Service) {}

  /**
   * 获取对象清单
   * @param operateId 操作序号，用于获取增量数据
   * @returns 对象清单
   */
  @Get("index")
  index(@Query("operateId", OperatePipe) operateId: number) {
    return this.commonSrv.index(operateId);
  }

  /**
   * 获取对象记录数
   * @returns 记录数
   */
  @Get("count")
  count() {
    return this.commonSrv.count();
  }

  /**
   * 获取对象详情
   * @param id 对象ID
   * @returns 对象详情
   */
  @Get("show/:id")
  async show(@Param("id", ParseIntPipe) id: number) {
    const common = await this.commonSrv.show(id);
    if (common === null) {
      throw new NotFoundException(`当前对象不存在！`);
    }
    return common;
  }

  /**
   * 获取对象变更日志
   * @param id 对象ID
   * @returns 对象变更记录
   */
  @Get("log/:id")
  log(@Param("id", ParseIntPipe) id: number) {
    return this.commonSrv.log(id);
  }

  /**
   * 创建对象
   * @param value 创建DTO
   * @param req 请求对象
   * @returns 新对象主键ID，如果创建失败则返回0
   */
  @Post("create")
  async create(
    @Body() value: CreateDto,
    @UserId() userId: number,
    @ReqId() reqId: number,
  ) {
    return this.commonSrv.create(value, userId, reqId);
  }

  /**
   * 更新对象（含禁用）
   * @param id 对象ID
   * @param value 更新DTO
   * @param req 请求对象
   * @returns 对象ID
   */
  @Post("update/:id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() value: UpdateDto,
    @UserId() userId: number,
    @ReqId() reqId: number,
  ) {
    return this.commonSrv.update(id, value, userId, reqId);
  }
}
