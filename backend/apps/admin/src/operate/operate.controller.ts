// 外部依赖
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from "@nestjs/common";
// 内部依赖
import { OperateService } from "@shared";
import { Allow } from "@auth";

@Controller("admin/operate")
@Allow("admin")
export class OperateController {
  constructor(readonly operateSrv: OperateService) {}
  /**
   * 获取操作序号清单
   * @param id 操作序号，用于获取增量数据
   * @returns 操作序号清单
   */
  @Post("index")
  async index(
    @Body("start", ParseIntPipe) start: number,
    @Body("end", ParseIntPipe) end: number,
  ) {
    return this.operateSrv.index(start, end);
  }

  /**
   * 获取操作序号详情
   * @param id 操作序号ID
   * @returns 操作序号详情
   */
  @Get("show/:id")
  async show(@Param("id", ParseIntPipe) id: number) {
    return this.operateSrv.show(id);
  }
}
