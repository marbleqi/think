// 外部依赖
import { Controller } from "@nestjs/common";
// 内部依赖
import { Allow, CommonController } from "@auth";
import { KeyDto, KeyService } from "@cloud";

@Controller("admin/key")
@Allow("admin")
export class KeyController extends CommonController<
  KeyService,
  KeyDto,
  KeyDto
> {
  constructor(readonly keySrv: KeyService) {
    super(keySrv);
  }
}
