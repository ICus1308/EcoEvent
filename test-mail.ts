import { sendOtpEmail } from "./lib/mailer";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  const result = await sendOtpEmail("test@example.com", "123456");
  console.log("Result:", result);
}

main().catch(console.error);
