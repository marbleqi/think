// 外部依赖
import { IsString, IsBoolean, IsOptional, Length } from "class-validator";

/**创建群组 DTO */
export class CreateGroupDto {
  /**群组名称 */
  @IsString()
  @Length(1, 50)
  name: string;

  /**群组描述 */
  @IsString()
  @IsOptional()
  @Length(0, 200)
  description?: string;

  /**群组头像 */
  @IsString()
  @IsOptional()
  avatar?: string;

  /**是否公开 */
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

/**更新群组 DTO */
export class UpdateGroupDto {
  /**群组名称 */
  @IsString()
  @IsOptional()
  @Length(1, 50)
  name?: string;

  /**群组描述 */
  @IsString()
  @IsOptional()
  @Length(0, 200)
  description?: string;

  /**群组头像 */
  @IsString()
  @IsOptional()
  avatar?: string;

  /**是否公开 */
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;

  /**是否启用 */
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
