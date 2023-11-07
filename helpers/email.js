import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: "kronos396@ukr.net",
    pass: process.env.UKR_UA_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

const sendVerificationEmail = async (user) => {
  const verificationLink = `http://localhost:3000/api/auth/verify/${user.verificationToken}`;
  const mailOptions = {
    from: "kronos396@ukr.net",
    to: user.email,
    subject: "Email Verification",
    text: `Click on the following link to verify your email: ${verificationLink}`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
    return true;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    console.error(error.stack);
    throw new Error("SendingEmailFailed");
  }
};

export default sendVerificationEmail;
