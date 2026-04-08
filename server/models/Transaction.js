const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  type: {
    type: String,
    enum: ['earning', 'withdrawal', 'bonus', 'referral', 'adjustment'],
    required: true
  },
  
  amount: { type: Number, required: true }, // Positive for credit, negative for debit
  
  // For earnings
  source: {
    type: String,
    enum: ['ad_revenue', 'subscriber_bonus', 'reward_points', 'referral', 'promotion'],
    required: true
  },
  
  // Related content (if applicable)
  contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
  
  // For reward points redemption
  pointsRedeemed: { type: Number },
  
  // Withdrawal details
  withdrawal: {
    method: { type: String, enum: ['upi', 'bank_transfer', 'paypal'] },
    details: {
      upiId: String,
      accountNumber: String,
      ifscCode: String,
      accountName: String
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'rejected'],
      default: 'pending'
    },
    processedAt: Date,
    transactionId: String, // External payment ID
    failureReason: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  
  // Balance after transaction
  balanceAfter: { type: Number, required: true },
  
  description: String,
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
