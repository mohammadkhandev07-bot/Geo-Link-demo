const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Temporary storage (use Redis in production)
const otpStore = new Map();

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Email and/or SMS
const sendOTP = async (email, phone) => {
  const otp = generateOTP();
  const tempId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Store OTP with expiry (10 minutes)
  otpStore.set(tempId, {
    otp,
    email,
    phone,
    attempts: 0,
    expiresAt: Date.now() + 10 * 60 * 1000
  });

  // Send Email OTP
  if (email) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: '"GeoLink" <noreply@geolink.com>',
      to: email,
      subject: 'Your GeoLink Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">GeoLink Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="font-size: 48px; letter-spacing: 10px; color: #333;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
  }

  // Send SMS OTP (using Twilio)
  if (phone) {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    await client.messages.create({
      body: `Your GeoLink verification code is: ${otp}. Valid for 10 minutes.`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });
  }

  return { tempId, message: 'OTP sent successfully' };
};

// Verify OTP
const verifyOTP = async (tempId, inputOTP) => {
  const data = otpStore.get(tempId);
  
  if (!data) {
    return { success: false, message: 'OTP expired or invalid' };
  }

  if (Date.now() > data.expiresAt) {
    otpStore.delete(tempId);
    return { success: false, message: 'OTP expired' };
  }

  if (data.attempts >= 3) {
    otpStore.delete(tempId);
    return { success: false, message: 'Too many attempts. Request new OTP.' };
  }

  data.attempts++;

  if (data.otp !== inputOTP) {
    return { success: false, message: 'Invalid OTP' };
  }

  // Clear OTP after successful verification
  otpStore.delete(tempId);
  return { success: true, email: data.email, phone: data.phone };
};

module.exports = { sendOTP, verifyOTP };
