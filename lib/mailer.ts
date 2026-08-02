import nodemailer from "nodemailer";

export async function sendOtpEmail(recipientEmail: string, otpCode: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"EcoEvent Hub" <no-reply@eco.vn>';

  // Console logging for verification inspection
  console.log("==========================================");
  console.log(`📧 [SMTP MAILER LOG]`);
  console.log(`Recipient: ${recipientEmail}`);
  console.log(`OTP Code: ${otpCode}`);
  console.log("==========================================");

  if (!host || !user || !pass) {
    console.log("⚠️ [SMTP NOTICE] Missing SMTP_HOST, SMTP_USER or SMTP_PASS in .env.");
    console.log("👉 Using console logging fallback. To send real emails, populate SMTP env variables in .env!");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587 or other ports
      auth: {
        user,
        pass
      }
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #059669; width: 48px; height: 48px; line-height: 48px; border-radius: 16px; color: #ffffff; font-size: 24px; font-weight: bold;">
            🌱
          </div>
          <h1 style="color: #064e3b; font-size: 24px; font-weight: 800; margin-top: 12px; margin-bottom: 4px;">EcoEvent Hub</h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Mã xác thực tài khoản (OTP)</p>
        </div>

        <div style="background-color: #ffffff; border-radius: 20px; padding: 32px; text-align: center; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <p style="color: #334155; font-size: 15px; font-weight: 600; margin-bottom: 20px;">
            Xin chào! Mã xác thực 6 chữ số của bạn là:
          </p>

          <div style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 16px; padding: 20px; display: inline-block; margin-bottom: 20px;">
            <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #047857;">
              ${otpCode}
            </span>
          </div>

          <p style="color: #64748b; font-size: 13px; margin-top: 8px;">
            ⏰ Mã này có hiệu lực trong vòng <strong>5 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.
          </p>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">EcoEvent Hub & Eco-Gear Marketplace • Giải pháp sự kiện xanh bền vững</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: recipientEmail,
      subject: `[EcoEvent Hub] Mã xác thực OTP của bạn: ${otpCode}`,
      html: htmlContent
    });

    console.log(`✅ [SMTP SUCCESS] Real email sent successfully to ${recipientEmail}`);
    return true;
  } catch (error) {
    console.error("❌ [SMTP ERROR] Failed to send real email via SMTP transporter:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(recipientEmail: string, otpCode: string): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"EcoEvent Hub" <no-reply@eco.vn>';

  if (!host || !user || !pass) {
    console.log("⚠️ [SMTP NOTICE] Missing SMTP config. Fallback logic triggered.");
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const htmlContent = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #064e3b; font-size: 24px; font-weight: 800; margin-top: 12px; margin-bottom: 4px;">EcoEvent Hub</h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Yêu cầu Đặt lại Mật khẩu</p>
        </div>

        <div style="background-color: #ffffff; border-radius: 20px; padding: 32px; text-align: center; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <p style="color: #334155; font-size: 15px; font-weight: 600; margin-bottom: 20px;">
            Xin chào! Đây là mã OTP để đặt lại mật khẩu của bạn:
          </p>

          <div style="background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 16px; padding: 20px; display: inline-block; margin-bottom: 20px;">
            <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 900; letter-spacing: 10px; color: #047857;">
              ${otpCode}
            </span>
          </div>

          <p style="color: #64748b; font-size: 13px; margin-top: 8px;">
            ⏰ Mã này có hiệu lực trong vòng <strong>10 phút</strong>. Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: recipientEmail,
      subject: `[EcoEvent Hub] Mã OTP đặt lại mật khẩu: ${otpCode}`,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error("❌ [SMTP ERROR] Failed to send password reset email:", error);
    return false;
  }
}
