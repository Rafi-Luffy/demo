import express from 'express';
import { emailService } from '../utils/emailService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Test welcome email
// @route   POST /api/test/email/welcome
// @access  Private (Admin only)
router.post('/welcome', protect, async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const result = await emailService.sendWelcomeEmail({
      name,
      email,
      loginUrl: `${process.env.FRONTEND_URL}/dashboard`
    });

    res.json({
      success: result,
      message: result ? 'Welcome email sent successfully' : 'Failed to send welcome email'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Test donation confirmation email
// @route   POST /api/test/email/donation
// @access  Private (Admin only)
router.post('/donation', protect, async (req, res, next) => {
  try {
    const { email, amount, campaign, transactionId } = req.body;

    if (!email || !amount || !campaign) {
      return res.status(400).json({
        success: false,
        message: 'Email, amount, and campaign are required'
      });
    }

    const result = await emailService.sendDonationConfirmationEmail(email, {
      amount,
      campaign,
      transactionId: transactionId || `TXN${Date.now()}`
    });

    res.json({
      success: result,
      message: result ? 'Donation confirmation email sent successfully' : 'Failed to send donation confirmation email'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Test password reset email
// @route   POST /api/test/email/reset
// @access  Private (Admin only)
router.post('/reset', protect, async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const resetToken = `reset-${Date.now()}`;
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const result = await emailService.sendPasswordResetEmail(email, resetToken, resetUrl);

    res.json({
      success: result,
      message: result ? 'Password reset email sent successfully' : 'Failed to send password reset email'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
