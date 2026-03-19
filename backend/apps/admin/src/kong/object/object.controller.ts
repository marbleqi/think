// 外部依赖
import { Controller, Post, Body } from "@nestjs/common";
// 内部依赖
import { Allow } from "@auth";
import {
  ObjectIndexDto,
  ObjectShowDto,
  ObjectCreateDto,
  ObjectUpdateDto,
  ObjectDestroyDto,
  ObjectPluginDto,
  KongService,
  ObjectService,
  KongObject,
  KongObjectResponse,
} from "@kong";

@Controller("kong/object")
@Allow("admin")
export class ObjectController {
  constructor(
    private readonly kongSrv: KongService,
    private readonly objectSrv: ObjectService,
  ) {}

  @Post("index")
  async index(@Body() body: ObjectIndexDto): Promise<KongObject[]> {
    const url = await this.kongSrv.url(body.kongId);
    return this.objectSrv.index(url, body.type);
  }

  @Post("show")
  async show(@Body() body: ObjectShowDto): Promise<KongObjectResponse> {
    const url = await this.kongSrv.url(body.kongId);
    return this.objectSrv.show(url, body.type, body.id);
  }

  @Post("plugin")
  async plugin(@Body() body: ObjectPluginDto): Promise<unknown> {
    const url = await this.kongSrv.url(body.kongId);
    return this.objectSrv.plugin(url);
  }

  @Post("create")
  async create(@Body() body: ObjectCreateDto): Promise<KongObjectResponse> {
    const url = await this.kongSrv.url(body.kongId);
    return this.objectSrv.create(url, body.type, body.value);
  }

  @Post("update")
  async update(@Body() body: ObjectUpdateDto): Promise<KongObjectResponse> {
    const url = await this.kongSrv.url(body.kongId);
    return this.objectSrv.update(url, body.type, body.id, body.value);
  }

  @Post("destroy")
  async destroy(@Body() body: ObjectDestroyDto): Promise<KongObjectResponse> {
    const url = await this.kongSrv.url(body.kongId);
    return this.objectSrv.destroy(url, body.type, body.id);
  }
}
