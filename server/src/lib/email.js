import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { AppError } from "../middlewares/errorHandler.js";

export const sendMail = async ({
  to,
  subject,
  intro,
  fullname,
  link,
  btnText,
  instructions,
}) => {
  if (!to || !subject || !intro) {
    throw new AppError(
      500,
      "to: Email receipient, subject, and intro are required"
    );
  }
  try {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "Instashot",
        link: process.env.CLIENT_URL || "https://instapics.vercel.app",
      },
    });
    const email = {
      body: {
        name: fullname,
        intro,
        action: {
          instructions:
            instructions || "To get started with Instashot, please click here:",
          button: {
            text: btnText || "Visit",
            link: link || process.env.CLIENT_URL,
          },
        },
        outro: "Need help, or have questions? Reply to this email",
      },
    };
    const emailBody = mailGenerator.generate(email);

    // Validate SMTP configuration
    if (!process.env.EMAIL || !process.env.EMAIL_PASSWORD) {
      throw createHttpError(500, "Email service not properly configured");
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.verify().catch((error) => {
      throw new AppError(
        500,
        `Failed to connect to email service: ${error.message}`
      );
    });

    // Send email
    const info = await transporter.sendMail({
      from: "Instapixs",
      to: to,
      subject: subject,
      html: emailBody,
    });
    if (process.env.NODE_ENV === "development") {
      console.log("✉️ Email sent successfully");
    }
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Email service error:", error);
    throw new AppError(500, "Failed to send email. Please try again later.");
  }
};
