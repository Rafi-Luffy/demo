import nodemailer from 'nodemailer';
import { User } from '../models/User.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface WelcomeEmailData {
  name: string;
  email: string;
  loginUrl?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify email configuration
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
    }
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'DilSeDaan <noreply@dilsedaan.org>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${options.to}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${options.to}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
    const subject = 'दिल से स्वागत है! Welcome to DilSeDaan 🙏';
    
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to DilSeDaan</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #fef7ed;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #f97316 0%, #16a34a 100%);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .hindi-text {
          font-size: 16px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-message {
          font-size: 24px;
          font-weight: bold;
          color: #f97316;
          margin-bottom: 20px;
          text-align: center;
        }
        .message-body {
          font-size: 16px;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .highlight {
          color: #f97316;
          font-weight: 600;
        }
        .features {
          background: #fef7ed;
          border-radius: 15px;
          padding: 25px;
          margin: 25px 0;
        }
        .feature-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          font-size: 14px;
        }
        .feature-icon {
          background: #f97316;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 12px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #f97316 0%, #16a34a 100%);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
          text-align: center;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .cta-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background: #1f2937;
          color: white;
          padding: 30px;
          text-align: center;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          color: #f97316;
          text-decoration: none;
          margin: 0 10px;
        }
        .stats {
          display: flex;
          justify-content: space-around;
          margin: 25px 0;
          text-align: center;
        }
        .stat-item {
          flex: 1;
        }
        .stat-number {
          font-size: 20px;
          font-weight: bold;
          color: #f97316;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">DilSeDaan ❤️</div>
          <div class="hindi-text">दिल से दान - सच्चा सेवा भाव</div>
        </div>

        <!-- Content -->
        <div class="content">
          <div class="welcome-message">
            नमस्ते ${userData.name}! 🙏
          </div>
          
          <div class="message-body">
            Thank you for joining <span class="highlight">DilSeDaan</span> - India's most trusted charity platform! Your account has been successfully created, and you're now part of a community that believes in the power of giving from the heart.
            
            <br><br>
            
            हमारे परिवार में आपका स्वागत है! Together, we're making a real difference in the lives of those who need it most across India.
          </div>

          <!-- Platform Stats -->
          <div class="stats">
            <div class="stat-item">
              <div class="stat-number">₹2.5Cr+</div>
              <div class="stat-label">Donated</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">12,500+</div>
              <div class="stat-label">Donors</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">75,000+</div>
              <div class="stat-label">Lives Touched</div>
            </div>
          </div>

          <!-- What you can do -->
          <div class="features">
            <h3 style="color: #f97316; margin-top: 0;">What you can do now:</h3>
            
            <div class="feature-item">
              <div class="feature-icon">❤️</div>
              <span>Explore authentic campaigns from Indian communities</span>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <span>Track your impact with transparent donation tracking</span>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">🤝</div>
              <span>Connect with volunteer opportunities in your area</span>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">🏆</div>
              <span>Create your own campaigns for causes close to your heart</span>
            </div>
            
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <span>Secure blockchain-based donations with full transparency</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${userData.loginUrl || 'https://dilsedaan.org'}" class="cta-button">
              Start Making Impact 🚀
            </a>
          </div>

          <div class="message-body">
            <strong>Need Help?</strong><br>
            Our support team is here to help you make the most of your giving journey. Feel free to reach out at <a href="mailto:support@dilsedaan.org" style="color: #f97316;">support@dilsedaan.org</a>
            
            <br><br>
            
            With gratitude,<br>
            <strong>The DilSeDaan Team</strong><br>
            <em>Making compassion simple, one donation at a time</em>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div>
            <strong>DilSeDaan - दिल से दान</strong><br>
            Transforming lives through transparent giving
          </div>
          
          <div class="social-links">
            <a href="#">Facebook</a> |
            <a href="#">Twitter</a> |
            <a href="#">Instagram</a> |
            <a href="#">LinkedIn</a>
          </div>
          
          <div style="font-size: 12px; opacity: 0.8; margin-top: 20px;">
            This email was sent to ${userData.email}<br>
            If you didn't create this account, please contact us immediately.<br>
            © 2024 DilSeDaan. All rights reserved.
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
Welcome to DilSeDaan - दिल से दान!

Hello ${userData.name},

Thank you for joining DilSeDaan, India's most trusted charity platform! Your account has been successfully created.

What you can do now:
• Explore authentic campaigns from Indian communities
• Track your impact with transparent donation tracking  
• Connect with volunteer opportunities
• Create your own campaigns for causes close to your heart
• Make secure blockchain-based donations

Visit: ${userData.loginUrl || 'https://dilsedaan.org'}

Need help? Contact us at support@dilsedaan.org

With gratitude,
The DilSeDaan Team
Making compassion simple, one donation at a time.
    `;

    return this.sendEmail({
      to: userData.email,
      subject,
      html,
      text
    });
  }

  async sendDonationConfirmationEmail(donorEmail: string, donationData: any): Promise<boolean> {
    const subject = 'Donation Confirmed - Thank You for Your Generosity! 🙏';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f97316 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px; }
        .content { padding: 30px; background: #fef7ed; border-radius: 10px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #f97316; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Donation Confirmed! ✅</h1>
          <p>Your generosity is making a real difference</p>
        </div>
        <div class="content">
          <p>Dear Donor,</p>
          <p>Thank you for your generous donation of <span class="amount">₹${donationData.amount}</span> to <strong>${donationData.campaign}</strong>.</p>
          <p>Your contribution will directly help those in need and create lasting positive impact.</p>
          <p>Transaction ID: <code>${donationData.transactionId}</code></p>
          <p>With heartfelt gratitude,<br>The DilSeDaan Team</p>
        </div>
      </div>
    </body>
    </html>
    `;

    return this.sendEmail({
      to: donorEmail,
      subject,
      html
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string): Promise<boolean> {
    const subject = 'Reset Your DilSeDaan Password 🔒';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your DilSeDaan account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p><small>This link will expire in 10 minutes.</small></p>
        <p>If you didn't request this reset, please ignore this email.</p>
      </div>
    </body>
    </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html
    });
  }
}

export const emailService = new EmailService();
