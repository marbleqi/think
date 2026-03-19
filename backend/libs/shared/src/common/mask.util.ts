/**敏感字段名称列表 */
const SENSITIVE_FIELDS = [
  "password",
  "pwd",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "auth",
  "key",
  "privateKey",
  "creditCard",
  "ssn",
  "phone",
  "mobile",
  "email",
];

/**掩码替换模式列表 */
const MASK_PATTERNS = [
  {
    pattern: /password["\s]*[=:]["\s]*([^&"\s,}]+)/gi,
    replace: 'password": "***"',
  },
  { pattern: /pwd["\s]*[=:]["\s]*([^&"\s,}]+)/gi, replace: 'pwd": "***"' },
  {
    pattern: /secret["\s]*[=:]["\s]*([^&"\s,}]+)/gi,
    replace: 'secret": "***"',
  },
];

/**
 * 判断值是否为对象
 * @param value 待判断的值
 * @returns 是否为对象
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * 掩码敏感字段值
 * @param value 原始值
 * @returns 掩码后的值
 */
function maskSensitiveField(value: string): string {
  if (value.length <= 2) {
    return "***";
  }
  if (value.length <= 6) {
    return value[0] + "*".repeat(value.length - 2) + value[value.length - 1];
  }
  return value.slice(0, 2) + "*".repeat(value.length - 4) + value.slice(-2);
}

/**
 * 掩码数据中的敏感信息
 * @param data 待处理的数据
 * @returns 掩码后的数据
 */
export function maskData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    let result = data;
    for (const { pattern, replace } of MASK_PATTERNS) {
      result = result.replace(pattern, replace);
    }
    return result;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskData(item));
  }

  if (isObject(data)) {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (
        SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()))
      ) {
        if (typeof value === "string") {
          masked[key] = maskSensitiveField(value);
        } else if (value !== null && value !== undefined) {
          masked[key] = "***";
        } else {
          masked[key] = value;
        }
      } else {
        masked[key] = maskData(value);
      }
    }
    return masked;
  }

  return data;
}
