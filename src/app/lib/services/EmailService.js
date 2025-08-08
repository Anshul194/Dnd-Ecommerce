import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to, subject, html, from) {
    try {
      const mailOptions = {
        from: from || process.env.EMAIL_FROM,
        to,
        subject,
        html,
      };
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('EmailService sendEmail Error:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }
}

export default EmailService;