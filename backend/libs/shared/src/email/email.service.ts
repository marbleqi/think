// 外部依赖
import { Injectable } from "@nestjs/common";
import { Transporter, createTransport } from "nodemailer";
// 内部依赖
import { Email } from "@shared";

/**邮件服务 */
@Injectable()
export class EmailService {
  /**邮件发送器 */
  transporter: Transporter;

  /**构造函数 */
  constructor() {
    this.transporter = createTransport({
      host: process.env.SMTP_HOST || "smtp.163.com", // 如果是 126 邮箱，则用 smtp.126.com
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465, // SSL 加密端口
      secure: true, // true for 465, false for other ports (如 587 则为 false)
      auth: {
        user: process.env.SMTP_ACCOUNT || "your-email@163.com", // 你的网易邮箱地址
        pass: process.env.SMTP_PASSWORD || "your-smtp-authorization-code", // 上面生成的【授权码】，不是邮箱密码！
      },
    });
  }

  /**发送邮件 */
  async send(email: Email): Promise<number> {
    console.debug("邮箱服务器准备完成");
    try {
      await this.transporter.sendMail(email);
      console.debug("邮件发送成功");
      return 1;
    } catch {
      console.debug("邮件发送失败");
      return 0;
    }
  }
}
