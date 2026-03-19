/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// 外部依赖
import { Injectable, HttpException, NotFoundException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
// 内部依赖
import { OperateService, CommonService, QueueService } from "@shared";
import { KongEntity, KongLogEntity } from ".";

@Injectable()
export class KongService extends CommonService<KongEntity, KongLogEntity> {
  /**
   * 构造函数
   * @param httpSrv HTTP 服务
   * @param operateSrv 操作序号服务
   * @param queueSrv 队列服务
   * @param kongRepository 网关存储器
   * @param kongLogRepository 网关日志存储器
   */
  constructor(
    private readonly httpSrv: HttpService,
    protected readonly operateSrv: OperateService,
    protected readonly queueSrv: QueueService,
    @InjectRepository(KongEntity)
    public readonly kongRepository: Repository<KongEntity>,
    @InjectRepository(KongLogEntity)
    private readonly kongLogRepository: Repository<KongLogEntity>,
  ) {
    super("kong", operateSrv, queueSrv, kongRepository, kongLogRepository);
  }

  async url(id: number) {
    const kong = await this.show(id);
    if (!kong) {
      throw new NotFoundException("指定网关不存在！");
    }
    return kong.url;
  }

  async report(id: number) {
    const kong = await this.show(id);
    if (!kong) {
      throw new NotFoundException("指定网关不存在！");
    }
    const url = kong.url;
    const result = await this.httpSrv.axiosRef.get(
      `${url}/default/license/report`,
    );
    if (result.status >= 400) {
      throw new HttpException(result.statusText, result.status);
    }
    return result.data;
  }

  async plugin(id: number) {
    const kong = await this.show(id);
    if (!kong) {
      throw new NotFoundException("指定网关不存在！");
    }
    const url = kong.url;
    const result = await this.httpSrv.axiosRef.get(`${url}/plugins/enabled`);
    if (result.status >= 400) {
      throw new HttpException(result.statusText, result.status);
    }
    return result.data?.enabled_plugins;
  }
}
