import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: process.env.MAIL_USER
    ? { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
    : undefined,
});

export async function sendVerificationEmail(email: string, token: string) {
  console.log("Envoi de l'email à", email, "avec le token", token);
  const verifyUrl = `${process.env.APP_URL}/register/verify?token=${token}`;

  

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "Confirmez votre adresse e-mail",
    html,
  });
}
