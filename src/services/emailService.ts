import nodemailer from "nodemailer";

interface VerificationEmailData {
  to: string;
  fullName: string;
  code: string;
}

interface ContactEmailData {
  fullName: string;
  email: string;
  message: string;
}

const getTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Email configuration is missing in the .env file.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendVerificationCodeEmail = async (
  data: VerificationEmailData
): Promise<void> => {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Kenya Shop" <${process.env.EMAIL_USER}>`,
    to: data.to,
    subject: "Your Kenya Shop Admin Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Kenya Shop Admin Verification</h2>
        <p>Hello ${data.fullName},</p>
        <p>Your admin verification code is:</p>
        <h1 style="letter-spacing: 4px;">${data.code}</h1>
        <p>This code expires in 15 minutes.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    `,
  });
};

export const sendContactMessageEmail = async (
  data: ContactEmailData
): Promise<void> => {
  const transporter = getTransporter();

  const receiverEmail =
    process.env.CONTACT_RECEIVER_EMAIL || "mucherulewis@gmail.com";

  await transporter.sendMail({
    from: `"Kenya Shop Contact Form" <${process.env.EMAIL_USER}>`,
    to: receiverEmail,
    replyTo: data.email,
    subject: `New Contact Message from ${data.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${data.fullName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
      </div>
    `,
  });
};