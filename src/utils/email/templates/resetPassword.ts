// utils/email/templates/resetPassword.ts
import { Recipient, EmailParams, Sender } from "mailersend";
import { mailersend } from "../mailer";

interface ResetPasswordEmailProps {
  toEmail: string;
  toName: string;
  resetLink: string;
  supportEmail: string;
}

export const sendResetPasswordEmail = async ({
  toEmail,
  toName,
  resetLink,
  supportEmail,
}: ResetPasswordEmailProps) => {
  const recipients = [new Recipient(toEmail, toName)];

  const personalization = [
    {
      email: toEmail,
      data: {
        link: resetLink,
        name: toName,
        account: {
          name: "QAirline",
        },
        support_email: supportEmail,
      },
    },
  ];

  const emailParams = new EmailParams()
    .setFrom(new Sender("qairline@trial-zr6ke4nkjzm4on12.mlsender.net", "QAirline"))
    .setTo(recipients)
    .setSubject("Đặt lại mật khẩu")
    .setTemplateId("3z0vklow1y147qrx")
    .setPersonalization(personalization);

  try {
    await mailersend.email.send(emailParams);
    console.log("Reset password email sent successfully!");
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    throw error;
  }
};
