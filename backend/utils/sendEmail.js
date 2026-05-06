import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  let transporter;

  // If no SMTP_USER is set or it's the default placeholder, use a test Ethereal account
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("⚠️ Using Ethereal dummy email service for testing.");
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const mailOptions = {
    from: 'CDAC ExamWeb <noreply@cdacexamweb.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your_email@gmail.com') {
    console.log("📧 Ethereal Email sent! Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};
