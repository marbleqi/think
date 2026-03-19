/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// 外部依赖
import { Injectable, HttpException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
// 内部依赖
import { KongObject, KongObjectResponse } from "./object.types";

@Injectable()
export class ObjectService {
  constructor(private readonly httpSrv: HttpService) {}

  async index(url: string, type: string): Promise<KongObject[]> {
    let result = await this.httpSrv.axiosRef.get(`${url}/${type}`, {
      validateStatus: () => true,
    });
    let apidata: KongObject[] = (result.data?.data as KongObject[]) || [];
    if (result.status >= 400) {
      throw new HttpException(result.data.message as string, result.status);
    }
    while (result.data.offset) {
      result = await this.httpSrv.axiosRef.get(`${url}${result.data.next}`, {
        validateStatus: () => true,
      });
      if (result.status >= 400) {
        throw new HttpException(result.data.message as string, result.status);
      }
      apidata = apidata.concat(result.data.data as KongObject[]);
    }
    return apidata;
  }

  async show(
    url: string,
    type: string,
    id: string,
  ): Promise<KongObjectResponse> {
    const result = await this.httpSrv.axiosRef.get(`${url}/${type}/${id}`, {
      validateStatus: () => true,
    });
    if (result.status >= 400) {
      throw new HttpException(result.data.message as string, result.status);
    }
    return result.data as KongObjectResponse;
  }

  async plugin(url: string): Promise<unknown> {
    const result = await this.httpSrv.axiosRef.get(`${url}/plugins/enabled`, {
      validateStatus: () => true,
    });
    if (result.status >= 400) {
      throw new HttpException(result.data.message as string, result.status);
    }
    return result.data;
  }

  async create(
    url: string,
    type: string,
    value: unknown,
  ): Promise<KongObjectResponse> {
    const result = await this.httpSrv.axiosRef.post(
      `${url}/${type}`,
      value as Record<string, unknown>,
      {
        validateStatus: () => true,
      },
    );
    if (result.status >= 400) {
      throw new HttpException(result.data.message as string, result.status);
    }
    return result.data as KongObjectResponse;
  }

  async update(
    url: string,
    type: string,
    id: string,
    value: unknown,
  ): Promise<KongObjectResponse> {
    const result = await this.httpSrv.axiosRef.patch(
      `${url}/${type}/${id}`,
      value as Record<string, unknown>,
      {
        validateStatus: () => true,
      },
    );
    if (result.status >= 400) {
      throw new HttpException(result.data.message as string, result.status);
    }
    return result.data as KongObjectResponse;
  }

  async destroy(
    url: string,
    type: string,
    id: string,
  ): Promise<KongObjectResponse> {
    const result = await this.httpSrv.axiosRef.delete(`${url}/${type}/${id}`, {
      validateStatus: () => true,
    });
    if (result.status >= 400) {
      throw new HttpException(result.data.message as string, result.status);
    }
    return result.data as KongObjectResponse;
  }
}
