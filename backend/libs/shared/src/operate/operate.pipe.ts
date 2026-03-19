// 外部依赖
import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";

/**
 * 操作类型转换管道
 * 将输入值转换为数字，转换失败返回-1
 */
@Injectable()
export class OperatePipe implements PipeTransform {
  /**
   * 管道转换方法
   * @param value 输入值
   * @param _metadata 参数元数据（未使用）
   * @returns 转换后的数字，失败返回-1
   */
  transform(value: any, _metadata: ArgumentMetadata): number {
    void _metadata;
    return Number(value) || -1;
  }
}
