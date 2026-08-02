import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load .env explicitly for this script
dotenv.config();

async function testSMTP() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  console.log("Testing SMTP Configuration...");
  console.log(`HOST: ${host}`);
  console.log(`PORT: ${port}`);
  console.log(`USER: ${user}`);
  console.log(`PASS: ${pass ? '******** (Loaded)' : 'MISSING'}`);

  if (!host || !user || !pass) {
    console.error("❌ Mising SMTP credentials in .env");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });

  try {
    console.log("Verifying connection to SMTP server...");
    await transporter.verify();
    console.log("✅ Kết nối tới Gmail SMTP Server THÀNH CÔNG! (Connection Successful)");
    console.log("👉 Bạn có thể bắt đầu đăng ký tài khoản trên Web để nhận mã OTP qua Email.");
  } catch (error) {
    console.error("❌ LỖI kết nối tới Gmail SMTP (Connection Failed):");
    console.error(error);
  }
}

testSMTP();
