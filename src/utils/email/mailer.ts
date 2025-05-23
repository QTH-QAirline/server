// utils/email/mailer.ts
import { MailerSend } from "mailersend";

export const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "YOUR_API_KEY",
});
