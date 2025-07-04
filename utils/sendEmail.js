const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a test transporter for development
  // In production, you would use a real email service
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_EMAIL || 'ethereal_user',
      pass: process.env.SMTP_PASSWORD || 'ethereal_password'
    }
  });

  const message = {
    from: `${process.env.FROM_NAME || 'SkillWorld'} <${process.env.FROM_EMAIL || 'noreply@skillworld.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
