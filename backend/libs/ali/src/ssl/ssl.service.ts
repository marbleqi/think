// 外部依赖
import { Injectable } from "@nestjs/common";
// 内部依赖
import { Config, ApiService, ApiResponse } from "..";

@Injectable()
export class SslService {
  constructor(private readonly apiSrv: ApiService) {}

  async list(
    KeyId: number,
    CurrentPage: number,
    ShowSize: number,
    params: { Keyword?: string; Status?: string } = {},
  ): Promise<ApiResponse> {
    const config: Config = {
      id: KeyId,
      method: "POST",
      endpoint: "https://cas.aliyuncs.com",
      action: "ListUserCertificateOrder",
      version: "2020-04-07",
      params: { CurrentPage, ShowSize, ...params },
    };
    return await this.apiSrv.api(config);
  }

  async certList(
    KeyId: number,
    CurrentPage: number,
    ShowSize: number,
  ): Promise<ApiResponse> {
    const config: Config = {
      id: KeyId,
      method: "POST",
      endpoint: "https://cas.aliyuncs.com",
      action: "DescribeUserCertificateList",
      version: "2018-07-13",
      params: { CurrentPage, ShowSize },
    };
    return await this.apiSrv.api(config);
  }

  async show(KeyId: number, OrderId: number): Promise<ApiResponse> {
    const config: Config = {
      id: KeyId,
      method: "POST",
      endpoint: "https://cas.aliyuncs.com",
      action: "DescribeCertificateState",
      version: "2020-04-07",
      params: { OrderId },
    };
    return await this.apiSrv.api(config);
  }

  async create(
    KeyId: number,
    InstanceId: string,
    Domain: string,
  ): Promise<ApiResponse> {
    const config: Config = {
      id: KeyId,
      method: "POST",
      endpoint: "https://cas.aliyuncs.com",
      action: "CreateDVOrderAudit",
      version: "2018-07-13",
      params: {
        InstanceId,
        Domain,
        City: "zhengzhou",
        DomainVerifyType: "DNS",
        Email: "marbleqi@163.com",
        Mobile: "13673618697",
        Province: "henan",
        Username: "戚晓栋",
      },
    };
    return await this.apiSrv.api(config);
  }
}
