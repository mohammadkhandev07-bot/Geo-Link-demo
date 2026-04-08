const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP, verifyOTP } = require('../utils/otp');
const { validatePassword } = require('../utils/validation');
const auth = require('../middleware/auth');

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Step 1: Send OTP
router.post('/send-otp', async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email or phone number required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Account already exists with this email/phone'
      });
    }

    // Generate and send OTP
    const result = await sendOTP(email, phone);
    
    res.json({
      success: true,
      message: 'OTP sent successfully',
      tempId: result.tempId // Temporary ID for verification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Step 2: Verify OTP and Complete Signup
router.post('/verify-and-signup', async (req, res) => {
  try {
    const { 
      tempId, 
      otp, 
      firstName, 
      lastName, 
      email, 
      phone, 
      password,
      accountType = 'private'
    } = req.body;

    // Verify OTP
    const otpResult = await verifyOTP(tempId, otp);
    if (!otpResult.success) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message
      });
    }

    // Create user
    const user = new User({
      fullName: { first: firstName, last: lastName },
      email,
      phone,
      password,
      accountType,
      isVerified: true,
      acceptedTerms: true,
      acceptedTermsAt: new Date()
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullNameDisplay,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Find user
    const user = await User.findOne({
      $or: [{ email }, { phone }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check account status
    if (user.status !== 'active') {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is suspended or banned' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullNameDisplay,
        email: user.email,
        phone: user.phone,
        accountType: user.accountType,
        avatar: user.avatar,
        channel: user.channel
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('channel.subscribers', 'fullName.first fullName.last avatar')
      .select('-password -otp');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Forgot password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    const user = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await sendOTP(user.email, user.phone);
    
    res.json({ success: true, message: 'Password reset OTP sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
