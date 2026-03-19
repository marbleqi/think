// 外部依赖
import { Controller } from "@nestjs/common";
// 内部依赖
import { SettingService } from "@shared";
import { Allow, OptionController } from "@auth";
import { SettingDto } from "..";

@Controller("admin/setting")
@Allow("admin")
export class SettingController extends OptionController<
  SettingService,
  SettingDto
> {
  constructor(readonly settingSrv: SettingService) {
    super(settingSrv);
  }
}
