/* eslint-disable @typescript-eslint/no-unused-vars */
// 外部依赖
import {
  NotFoundException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { createHmac, createHash } from "crypto";
// 内部依赖
import { KeyService } from "@cloud";
import { Config } from "..";

@Injectable()
export class ApiService {
  constructor(
    private readonly httpSrv: HttpService,
    private readonly keySrv: KeyService,
  ) {}

  async ssl(id: number) {
    const key = await this.keySrv.show(id);
    if (key === null) {
      throw new NotFoundException(`当前密钥不存在！`);
    }
    if (!key.status) {
      throw new ForbiddenException(`当前密钥已禁用！`);
    }
    const config: Config = {
      id: 1,
      host: "ssl.tencentcloudapi.com",
      service: "ssl",
      region: "",
      action: "DescribeCertificateDetail",
      version: "2019-12-05",
      params: { CertificateId: "Slv1S6aB" },
    };
  }

  async api(config: Config) {
    const key = await this.keySrv.show(config.id);
    if (key === null) {
      throw new NotFoundException(`请求的密钥不存在`);
    }
    const SECRET_ID = key.key;
    const SECRET_KEY = key.secret;
    const host = config.host;
    const service = config.service;
    const region = config.region;
    const action = config.action;
    const version = config.version;
    const now = Date.now();
    const timestamp = Math.floor(now / 1000);
    console.debug("时间戳", timestamp, now);
    const date = new Date(now).toISOString().substring(0, 10);
    const payload = JSON.stringify(config.params);
    const signedHeaders = "content-type;host";
    const hashedRequestPayload = createHash("sha256")
      .update(payload)
      .digest("hex");
    const httpRequestMethod = "POST";
    const canonicalUri = "/";
    const canonicalQueryString = "";
    const canonicalHeaders =
      "content-type:application/json; charset=utf-8\n" + "host:" + host + "\n";
    const canonicalRequest =
      httpRequestMethod +
      "\n" +
      canonicalUri +
      "\n" +
      canonicalQueryString +
      "\n" +
      canonicalHeaders +
      "\n" +
      signedHeaders +
      "\n" +
      hashedRequestPayload;
    console.debug("规范请求串", canonicalRequest);
    const algorithm = "TC3-HMAC-SHA256";
    const hashedCanonicalRequest = createHash("sha256")
      .update(canonicalRequest)
      .digest("hex");
    const credentialScope = date + "/" + service + "/" + "tc3_request";
    const stringToSign =
      algorithm +
      "\n" +
      timestamp +
      "\n" +
      credentialScope +
      "\n" +
      hashedCanonicalRequest;
    console.debug("待签名字符串", stringToSign);
    const kDate = createHmac("sha256", "TC3" + SECRET_KEY)
      .update(date)
      .digest();
    const kService = createHmac("sha256", kDate).update(service).digest();
    const kSigning = createHmac("sha256", kService)
      .update("tc3_request")
      .digest();
    const signature = createHmac("sha256", kSigning)
      .update(stringToSign)
      .digest("hex");
    console.debug("签名", signature, typeof signature);
    const authorization =
      algorithm +
      " " +
      "Credential=" +
      SECRET_ID +
      "/" +
      credentialScope +
      ", " +
      "SignedHeaders=" +
      signedHeaders +
      ", " +
      "Signature=" +
      signature;
    console.debug("Authorization", authorization);
    const headers = {
      Authorization: authorization,
      "Content-Type": "application/json; charset=utf-8",
      Host: host,
      "X-TC-Action": action,
      "X-TC-Timestamp": timestamp,
      "X-TC-Version": version,
    };
    if (region) {
      headers["X-TC-Region"] = region;
    }

    console.debug("headers", headers);
    console.debug("payload", payload);

    const result = await this.httpSrv.axiosRef.request({
      url: `https://${host}`,
      method: httpRequestMethod,
      headers,
      data: payload,
    });

    console.debug("data", result.data);
    return result;
  }
}
