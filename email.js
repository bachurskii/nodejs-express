import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const smtpConfig = {
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
    user: "george_n1@meta.ua",
    pass: process.env.META_UA_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

const mailOptions = {
  from: "george_n1@meta.ua",
  to: "georgijbacurskij@gmail.com",
  subject: "Nodemailer Test",
  text: "Hello, this is a test email from Nodemailer.",
  html: "<p>Hello, this is a test email from <b>Nodemailer</b>.</p>",
};

transporter
  .sendMail(mailOptions)
  .then((info) => console.log(`Email sent: ${info.response}`))
  .catch((error) => console.error(`Error sending email: ${error}`));

export default transporter;
