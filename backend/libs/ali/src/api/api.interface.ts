/**阿里云请求参数 */
export interface Config {
  /**密钥ID */
  id: number;
  /**请求方法 */
  method: "GET" | "POST";
  /**服务地址 */
  endpoint: string;
  /**API名称 */
  action: string;
  /**API版本 */
  version: string;
  /**请求参数 */
  params?: object;
}

/**阿里云API响应 */
export interface ApiResponse {
  Message?: string;
  [key: string]: any;
}
