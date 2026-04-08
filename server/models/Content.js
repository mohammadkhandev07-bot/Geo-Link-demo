const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // Creator
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  
  // Content Details
  title: { 
    type: String, 
    required: true, 
    maxlength: 200,
    trim: true 
  },
  description: { 
    type: String, 
    maxlength: 5000,
    trim: true 
  },
  
  // Media
  type: { 
    type: String, 
    enum: ['video', 'photo', 'reel', 'story'], 
    required: true 
  },
  mediaUrl: { type: String, required: true }, // Main file URL
  thumbnailUrl: { type: String }, // For videos
  duration: { type: Number }, // For videos (seconds)
  
  // Quality variants for adaptive streaming
  variants: [{
    quality: String, // 360p, 480p, 720p, 1080p
    url: String,
    size: Number // bytes
  }],
  
  // Metadata
  category: { type: String, index: true },
  tags: [{ type: String, index: true }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
    name: String
  },
  language: { type: String, default: 'en' },
  
  // Engagement (For reward points calculation)
  stats: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    watchTime: { type: Number, default: 0 } // Total seconds watched
  },
  
  // Who engaged (for preventing duplicate points)
  engagementDetails: {
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sharedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downloadedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  
  // Reward points generated for creator
  rewardPointsGenerated: {
    fromLikes: { type: Number, default: 0 },
    fromViews: { type: Number, default: 0 },
    fromComments: { type: Number, default: 0 },
    fromShares: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  
  // Comments
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Visibility
  visibility: {
    type: String,
    enum: ['public', 'subscribers_only', 'private'],
    default: 'public'
  },
  
  // Monetization
  monetization: {
    enabled: { type: Boolean, default: true },
    adBreaks: [{ position: Number, type: String }], // For future ad insertion
    sponsorInfo: {
      isSponsored: { type: Boolean, default: false },
      sponsorName: String,
      sponsorLink: String
    }
  },
  
  // Processing status
  processingStatus: {
    type: String,
    enum: ['uploading', 'processing', 'ready', 'failed'],
    default: 'uploading'
  },
  
  // Reports
  reports: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    details: String,
    createdAt: { type: Date, default: Date.now }
  }],
  reportCount: { type: Number, default: 0 },
  
  // Algorithm signals
  algorithm: {
    score: { type: Number, default: 0 }, // For feed ranking
    trending: { type: Boolean, default: false },
    featured: { type: Boolean, default: false }
  },
  
  // Scheduled publish
  scheduledFor: { type: Date },
  publishedAt: { type: Date, default: Date.now },
  
  // Soft delete
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for search and feed
contentSchema.index({ createdAt: -1, 'algorithm.score': -1 });
contentSchema.index({ tags: 1, category: 1 });
contentSchema.index({ location: '2dsphere' });
contentSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Calculate reward points for creator
contentSchema.methods.calculateCreatorPoints = function() {
  const points = {
    likes: this.stats.likes * 1,      // 1 like = 1 point
    views: Math.floor(this.stats.views / 5) * 1,  // 5 views = 1 point
    comments: this.stats.comments * 2, // 1 comment = 2 points
    shares: this.stats.shares * 5    // 1 share = 5 points
  };
  return points;
};

module.exports = mongoose.model('Content', contentSchema);
