import { emailService } from '../utils/emailService.js';

// Test email functionality
async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test 1: Welcome Email
  console.log('📧 Testing Welcome Email...');
  try {
    const result = await emailService.sendWelcomeEmail({
      name: 'Rahul Kumar',
      email: 'test@example.com', // Replace with your test email
      loginUrl: 'http://localhost:3000/dashboard'
    });
    
    if (result) {
      console.log('✅ Welcome email test passed!');
    } else {
      console.log('❌ Welcome email test failed!');
    }
  } catch (error) {
    console.error('❌ Welcome email error:', error);
  }

  // Test 2: Donation Confirmation Email
  console.log('\n📧 Testing Donation Confirmation Email...');
  try {
    const result = await emailService.sendDonationConfirmationEmail(
      'test@example.com', // Replace with your test email
      {
        amount: 1000,
        campaign: 'गरीब बच्चों की शिक्षा (Education for Poor Children)',
        transactionId: 'TXN123456789'
      }
    );
    
    if (result) {
      console.log('✅ Donation confirmation email test passed!');
    } else {
      console.log('❌ Donation confirmation email test failed!');
    }
  } catch (error) {
    console.error('❌ Donation confirmation email error:', error);
  }

  // Test 3: Password Reset Email
  console.log('\n📧 Testing Password Reset Email...');
  try {
    const result = await emailService.sendPasswordResetEmail(
      'test@example.com', // Replace with your test email
      'reset-token-123',
      'http://localhost:3000/reset-password?token=reset-token-123'
    );
    
    if (result) {
      console.log('✅ Password reset email test passed!');
    } else {
      console.log('❌ Password reset email test failed!');
    }
  } catch (error) {
    console.error('❌ Password reset email error:', error);
  }

  console.log('\n🎉 Email service testing completed!');
  console.log('📝 Check your email inbox for test messages.');
}

// Run tests if this script is executed directly
// Note: Update the email address in the tests above before running
export { testEmailService };
