// 外部依赖
import { Injectable } from "@nestjs/common";
// 内部依赖
import { Config, ApiService } from "..";

@Injectable()
export class SslService {
  constructor(private readonly apiSrv: ApiService) {}

  list(KeyId: number) {
    const config: Config = {
      id: KeyId,
      host: "ssl.tencentcloudapi.com",
      service: "ssl",
      region: "",
      action: "DescribeCertificateDetail",
      version: "2019-12-05",
      params: { CertificateId: "Slv1S6aB" },
    };
    return this.apiSrv.api(config);
  }

  show(KeyId: number) {
    const config: Config = {
      id: KeyId,
      host: "ssl.tencentcloudapi.com",
      service: "ssl",
      region: "",
      action: "DescribeCertificateDetail",
      version: "2019-12-05",
      params: { CertificateId: "Slv1S6aB" },
    };
    return this.apiSrv.api(config);
  }
}
