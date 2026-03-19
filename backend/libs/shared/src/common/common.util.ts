/**
 * 生成指定长度的随机字符串
 * @param length 随机字符串长度
 * @param type 随机字符串类型，默认字符串型
 * @returns 指定长度的随机字符串
 */
export function random(
  length: number,
  type: "string" | "number" = "string",
): string {
  /**随机字符串游标 */
  let i = 0;
  /**可选字符集 */
  const chars =
    type === "string"
      ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890"
      : "1234567890";
  /**字符集长度 */
  const maxPos = chars.length;
  /**随机字符串 */
  let result: string = "";
  while (i < length) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
    i++;
  }
  return result;
}
