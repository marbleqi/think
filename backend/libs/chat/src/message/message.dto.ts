// 外部依赖
import { IsString, IsOptional, IsEnum, Length } from "class-validator";
import type { MessageType } from "./message.entity";

/**发送消息 DTO */
export class SendMessageDto {
  /**群组ID */
  groupId: number;

  /**消息类型 */
  @IsEnum(["text", "image", "file", "ai"])
  @IsOptional()
  type?: MessageType;

  /**消息内容 */
  @IsString()
  @Length(1, 10000)
  content: string;

  /**元数据 JSON */
  @IsString()
  @IsOptional()
  metadata?: string;
}

/**获取消息列表 DTO */
export class GetMessagesDto {
  /**群组ID */
  groupId: number;

  /**分页：最后一条消息ID */
  @IsOptional()
  beforeId?: number;

  /**分页数量，默认 50 */
  @IsOptional()
  limit?: number;
}
