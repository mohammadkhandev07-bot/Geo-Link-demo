const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Content = require('../models/Content');

// Create Channel (Convert to Public Account)
router.post('/create', auth, async (req, res) => {
  try {
    const { channelName, handle, description, category, whyCreate } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    // Check if already has channel
    if (user.channel.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'Channel already exists' 
      });
    }

    // Validate handle uniqueness
    const existingHandle = await User.findOne({ 'channel.handle': handle });
    if (existingHandle) {
      return res.status(400).json({ 
        success: false, 
        message: 'Handle already taken' 
      });
    }

    // Update user to public account with channel
    user.accountType = 'public';
    user.channel = {
      name: channelName,
      handle: handle.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      description,
      category,
      whyCreate, // Store reason for admin review if needed
      isActive: true,
      createdAt: new Date(),
      subscriberCount: 0
    };

    await user.save();

    res.json({
      success: true,
      message: 'Channel created successfully',
      channel: user.channel
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Channel Details
router.get('/:handle', async (req, res) => {
  try {
    const { handle } = req.params;
    
    const user = await User.findOne({ 'channel.handle': handle })
      .select('fullName avatar channel followersCount')
      .populate('channel.subscribers', 'fullName.first avatar');

    if (!user || !user.channel.isActive) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    // Get channel content
    const content = await Content.find({ 
      creator: user._id,
      isDeleted: false,
      visibility: 'public'
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({
      success: true,
      channel: {
        ...user.toObject(),
        content
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Subscribe/Unsubscribe
router.post('/:handle/subscribe', auth, async (req, res) => {
  try {
    const { handle } = req.params;
    const userId = req.userId;

    const channel = await User.findOne({ 'channel.handle': handle });
    if (!channel) {
      return res.status(404).json({ success: false, message: 'Channel not found' });
    }

    const isSubscribed = channel.channel.subscribers.includes(userId);

    if (isSubscribed) {
      // Unsubscribe
      channel.channel.subscribers.pull(userId);
      channel.channel.subscriberCount--;
    } else {
      // Subscribe
      channel.channel.subscribers.push(userId);
      channel.channel.subscriberCount++;
      
      // Check monetization eligibility (5000 subscribers)
      if (channel.channel.subscriberCount >= 5000 && !channel.channel.isMonetized) {
        channel.channel.isMonetized = true;
        channel.channel.monetizationAppliedAt = new Date();
        
        // Add monthly bonus
        channel.earnings.monthlySubscriberBonus = 500;
      }
    }

    await channel.save();

    res.json({
      success: true,
      subscribed: !isSubscribed,
      subscriberCount: channel.channel.subscriberCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Channel Dashboard (Creator Only)
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (user.accountType !== 'public' || !user.channel.isActive) {
      return res.status(403).json({ success: false, message: 'Not a creator account' });
    }

    // Get content stats
    const contentStats = await Content.aggregate([
      { $match: { creator: user._id } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          totalViews: { $sum: '$stats.views' },
          totalLikes: { $sum: '$stats.likes' },
          totalComments: { $sum: '$stats.comments' },
          totalShares: { $sum: '$stats.shares' }
        }
      }
    ]);

    // Calculate reward points from content
    const totalPoints = contentStats[0] ? 
      (contentStats[0].totalLikes * 1) + 
      (Math.floor(contentStats[0].totalViews / 5) * 1) + 
      (contentStats[0].totalComments * 2) + 
      (contentStats[0].totalShares * 5) : 0;

    // Get monthly earnings
    const monthlyEarnings = user.earnings.monthlySubscriberBonus;
    const adRevenue = user.earnings.total - monthlyEarnings; // Simplified

    res.json({
      success: true,
      dashboard: {
        channel: user.channel,
        stats: contentStats[0] || {
          totalVideos: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0
        },
        earnings: {
          total: user.earnings.total,
          monthlySubscriberBonus: monthlyEarnings,
          adRevenue: adRevenue,
          pending: user.earnings.pending,
          canWithdraw: user.earnings.total >= 1000
        },
        rewardPoints: {
          current: user.rewardPoints.current,
          redeemable: Math.floor(user.rewardPoints.current / 100) * 10,
          totalGenerated: totalPoints
        },
        growth: {
          subscribersThisMonth: 0, // Calculate from history
          viewsThisMonth: 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
