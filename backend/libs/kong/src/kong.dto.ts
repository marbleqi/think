// 外部依赖
import { IsNotEmpty } from "class-validator";

export class KongDto {
  @IsNotEmpty({ message: "实例名称不能为空" })
  name: string;

  @IsNotEmpty({ message: "实例说明不能为空" })
  description: string;

  @IsNotEmpty({ message: "接口地址不能为空" })
  url: string;

  @IsNotEmpty({ message: "启用状态不能为空" })
  status: boolean;
}
