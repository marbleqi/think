import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { Allow, CommonController } from "@auth";
import { KongDto, KongService } from "@kong";

@Controller("kong")
@Allow("admin")
export class KongController extends CommonController<
  KongService,
  KongDto,
  KongDto
> {
  constructor(readonly commonSrv: KongService) {
    super(commonSrv);
  }

  @Get("report/:id")
  report(@Param("id", ParseIntPipe) id: number) {
    return this.commonSrv.report(id);
  }

  @Get("plugin/:id")
  plugin(@Param("id", ParseIntPipe) id: number) {
    return this.commonSrv.plugin(id);
  }
}
