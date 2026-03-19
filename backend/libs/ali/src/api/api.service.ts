// 外部依赖
import {
  Injectable,
  HttpException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { createHmac } from "crypto";
// 内部依赖
import { random } from "@shared";
import { KeyService } from "@cloud";
import { Config, ApiResponse } from "..";

@Injectable()
export class ApiService {
  constructor(
    private readonly httpSrv: HttpService,
    private readonly keySrv: KeyService,
  ) {}

  async api(config: Config) {
    const key = await this.keySrv.show(config.id);
    if (key === null) {
      throw new NotFoundException(`请求的密钥不存在`);
    }
    const AccessKeyId = key.key;
    const secret = key.secret;
    const params = config.params ? config.params : {};
    const nonce = random(32);
    const opts = {
      Action: config.action,
      Version: config.version,
      Format: "JSON",
      AccessKeyId,
      SignatureNonce: nonce,
      Timestamp: new Date().toISOString(),
      SignatureMethod: "HMAC-SHA1",
      SignatureVersion: "1.0",
    };
    const sortParams = { ...opts, ...params };
    const keys = Object.keys(sortParams).sort();
    const query = keys
      .map(
        (key) =>
          encodeURIComponent(key) +
          "=" +
          encodeURIComponent(String(sortParams[key])),
      )
      .join("&");
    const url = `${config.endpoint}?${query}`;
    const stringToSign = `${config.method}&${encodeURIComponent(
      "/",
    )}&${encodeURIComponent(query)}`;
    console.debug("待签名字符串", stringToSign);
    const Signature = createHmac("sha1", secret + "&")
      .update(stringToSign)
      .digest("base64");
    if (config.method === "GET") {
      const result = await this.httpSrv.axiosRef.get(
        `${url}&Signature=${encodeURIComponent(Signature)}`,
        {
          validateStatus: () => true,
        },
      );
      if (result.status >= 200 && result.status < 300) {
        return result.data as ApiResponse;
      } else {
        const data = result.data as ApiResponse;
        throw new HttpException(data.Message || "请求失败", result.status);
      }
    }
    if (config.method === "POST") {
      const result = await this.httpSrv.axiosRef.post(
        `${url}&Signature=${encodeURIComponent(Signature)}`,
        params,
        {
          validateStatus: () => true,
        },
      );
      if (result.status >= 200 && result.status < 300) {
        return result.data as ApiResponse;
      } else {
        const data = result.data as ApiResponse;
        throw new HttpException(data.Message || "请求失败", result.status);
      }
    }
    throw new BadRequestException(`请求方法错误`);
  }
}
