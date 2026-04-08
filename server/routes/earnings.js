const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get Earnings Dashboard
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Calculate redeemable points
    const pointsValue = Math.floor(user.rewardPoints.current / 100) * 10;
    const canWithdraw = user.earnings.total >= 1000;

    res.json({
      success: true,
      earnings: {
        total: user.earnings.total,
        available: user.earnings.total - user.earnings.pending,
        pending: user.earnings.pending,
        withdrawn: user.earnings.withdrawn,
        canWithdraw: canWithdraw,
        minimumWithdrawal: 1000,
        monthlyBonus: user.earnings.monthlySubscriberBonus
      },
      rewardPoints: {
        current: user.rewardPoints.current,
        valueInRupees: pointsValue,
        conversionRate: '1000 points = ₹10',
        history: user.pointHistory.slice(-20).reverse()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Redeem Points to Cash
router.post('/redeem-points', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Calculate redeemable amount (1000 points = ₹10)
    const redeemablePoints = Math.floor(user.rewardPoints.current / 100) * 100;
    const redeemableAmount = (redeemablePoints / 100) * 10;

    if (redeemablePoints < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 1000 points required to redeem'
      });
    }

    // Deduct points
    user.rewardPoints.current -= redeemablePoints;
    user.rewardPoints.redeemed += redeemablePoints;
    
    // Add to earnings
    user.earnings.total += redeemableAmount;
    
    // Record transaction
    const transaction = new Transaction({
      user: req.userId,
      type: 'earning',
      amount: redeemableAmount,
      source: 'reward_points',
      pointsRedeemed: redeemablePoints,
      balanceAfter: user.earnings.total,
      description: `Redeemed ${redeemablePoints} points for ₹${redeemableAmount}`
    });
    
    await transaction.save();
    await user.save();

    res.json({
      success: true,
      message: `₹${redeemableAmount} added to your earnings`,
      redeemedPoints: redeemablePoints,
      newBalance: user.earnings.total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Request Withdrawal
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount, method, details } = req.body; // method: 'upi' or 'bank'
    const user = await User.findById(req.userId);

    // Validation
    if (user.earnings.total < 1000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum ₹1000 required for withdrawal',
        currentBalance: user.earnings.total,
        needed: 1000 - user.earnings.total
      });
    }

    if (amount > user.earnings.total) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹500'
      });
    }

    // Validate payment details
    if (method === 'upi' && !details.upiId) {
      return res.status(400).json({ success: false, message: 'UPI ID required' });
    }
    
    if (method === 'bank_transfer') {
      if (!details.accountNumber || !details.ifscCode || !details.accountName) {
        return res.status(400).json({ success: false, message: 'All bank details required' });
      }
    }

    // Deduct from available balance
    user.earnings.total -= amount;
    user.earnings.pending += amount;

    // Create withdrawal transaction
    const transaction = new Transaction({
      user: req.userId,
      type: 'withdrawal',
      amount: -amount,
      source: 'withdrawal',
      balanceAfter: user.earnings.total,
      withdrawal: {
        method,
        details,
        status: 'pending'
      },
      description: `Withdrawal request for ₹${amount} via ${method.toUpperCase()}`
    });

    await transaction.save();
    await user.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      transactionId: transaction._id,
      status: 'pending',
      estimatedTime: '3-5 business days'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Transaction History
router.get('/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const transactions = await Transaction.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
