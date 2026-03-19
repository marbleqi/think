// 外部依赖
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import type { Request } from "express";
// 内部依赖
import { ReqDto, ReqService } from "@shared";
import { Allow } from "@auth";

@Controller("admin/req")
@Allow("admin")
export class ReqController {
  constructor(readonly reqSrv: ReqService) {}

  /**
   * 获取请求路径列表
   * @returns 请求路径列表
   */
  @Get("url")
  async url() {
    return this.reqSrv.url();
  }

  /**
   * 获取控制器列表
   * @returns 控制器列表
   */
  @Get("controller")
  async controller() {
    return this.reqSrv.controller();
  }

  /**
   * 获取方法列表
   * @param controller 控制器名
   * @returns 方法列表
   */
  @Get("action/:controller")
  async action(@Param("controller") controller: string) {
    return this.reqSrv.action(controller);
  }

  /**
   * 搜索请求日志记录
   * @param value 请求日志搜索条件
   * @param reqId 当前请求ID（去除当前日志ID）
   * @returns 请求日志记录
   */
  @Post("index")
  async index(@Body() value: ReqDto, @Req() req: Request) {
    return this.reqSrv.index(value, Number(req["reqId"]));
  }

  /**
   * 获取日志详情
   * @param id 日志ID
   * @returns 请求日志详情
   */
  @Get("show/:id")
  async show(@Param("id", ParseIntPipe) id: number) {
    return this.reqSrv.show(id);
  }
}
