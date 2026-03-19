// 外部依赖
import { IsNotEmpty, IsOptional } from "class-validator";

export class ObjectDto {
  @IsNotEmpty({ message: "实例ID不能为空" })
  kongId: number;

  @IsOptional()
  type?: string;

  @IsOptional()
  id?: string;

  @IsOptional()
  value?: unknown;
}

export class ObjectIndexDto {
  @IsNotEmpty({ message: "实例ID不能为空" })
  kongId: number;

  @IsNotEmpty({ message: "对象类型不能为空" })
  type: string;
}

export class ObjectShowDto {
  @IsNotEmpty({ message: "实例ID不能为空" })
  kongId: number;

  @IsNotEmpty({ message: "对象类型不能为空" })
  type: string;

  @IsNotEmpty({ message: "对象ID不能为空" })
  id: string;
}

export class ObjectCreateDto {
  @IsNotEmpty({ message: "实例ID不能为空" })
  kongId: number;

  @IsNotEmpty({ message: "对象类型不能为空" })
  type: string;

  @IsNotEmpty({ message: "对象信息不能为空" })
  value: unknown;
}

export class ObjectUpdateDto {
  @IsNotEmpty({ message: "实例ID不能为空" })
  kongId: number;

  @IsNotEmpty({ message: "对象类型不能为空" })
  type: string;

  @IsNotEmpty({ message: "对象ID不能为空" })
  id: string;

  @IsNotEmpty({ message: "对象信息不能为空" })
  value: unknown;
}

export class ObjectDestroyDto {
  @IsNotEmpty({ message: "实例ID不能为空" })
  kongId: number;

  @IsNotEmpty({ message: "对象类型不能为空" })
  type: string;

  @IsNotEmpty({ message: "对象ID不能为空" })
  id: string;
}

export class ObjectPluginDto {
  @IsNotEmpty({ message: "实例ID不能为空" })
  kongId: number;
}
