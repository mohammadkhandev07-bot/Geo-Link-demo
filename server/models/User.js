const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  fullName: {
    first: { type: String, required: true, trim: true },
    last: { type: String, required: true, trim: true }
  },
  email: { 
    type: String, 
    unique: true, 
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: { type: String, required: true, minlength: 8 },
  
  // Account Types
  accountType: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  
  // Profile
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500 },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
    city: String,
    country: String
  },
  
  // Channel (Only for public accounts)
  channel: {
    name: { type: String, trim: true },
    handle: { type: String, unique: true, sparse: true, lowercase: true },
    description: { type: String, maxlength: 1000 },
    category: { type: String },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscriberCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    isMonetized: { type: Boolean, default: false }, // 5000+ subscribers
    monetizationAppliedAt: { type: Date }
  },
  
  // Earnings System
  earnings: {
    total: { type: Number, default: 0 }, // In rupees
    pending: { type: Number, default: 0 },
    withdrawn: { type: Number, default: 0 },
    lastPayout: { type: Date },
    monthlySubscriberBonus: { type: Number, default: 0 } // ₹500/month if qualified
  },
  
  // Reward Points System
  rewardPoints: {
    current: { type: Number, default: 0 },
    lifetime: { type: Number, default: 0 },
    redeemed: { type: Number, default: 0 }
  },
  
  // Point History for transparency
  pointHistory: [{
    action: { 
      type: String, 
      enum: ['like_received', 'view_received', 'comment_received', 'share_received', 
             'like_given', 'comment_posted', 'share_done', 'video_uploaded', 'redeemed']
    },
    points: { type: Number },
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verificationBadge: { type: String, enum: ['none', 'blue', 'gold'], default: 'none' },
  
  // Security
  otp: {
    code: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 }
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Settings
  settings: {
    isPrivate: { type: Boolean, default: false },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    locationSharing: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: true }
  },
  
  // Activity
  lastActive: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
  socketId: String,
  
  // Library & Saved Content
  library: {
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
    folders: [{
      name: String,
      contents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
      createdAt: { type: Date, default: Date.now }
    }],
    watchHistory: [{
      content: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
      watchedAt: { type: Date, default: Date.now },
      progress: { type: Number, default: 0 } // seconds watched
    }]
  },
  
  // Following/Followers
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followingCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
  
  // Blocked/Reported
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedContent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Content' }],
  
  // Legal
  acceptedTerms: { type: Boolean, default: false },
  acceptedTermsAt: { type: Date },
  acceptedPrivacyPolicy: { type: Boolean, default: false },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'deactivated'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ 'channel.handle': 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ 'channel.subscriberCount': -1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullNameDisplay').get(function() {
  return `${this.fullName.first} ${this.fullName.last}`;
});

// Calculate redeemable amount from points
userSchema.methods.getRedeemableAmount = function() {
  return Math.floor(this.rewardPoints.current / 100) * 10; // 1000 points = ₹10
};

module.exports = mongoose.model('User', userSchema);
