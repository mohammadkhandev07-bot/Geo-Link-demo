const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const User = require('../models/User');

// Universal Search
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query too short' });
    }

    const results = {
      videos: [],
      photos: [],
      profiles: [],
      channels: []
    };

    // Search Videos & Photos
    if (type === 'all' || type === 'videos' || type === 'photos') {
      const contentQuery = {
        $text: { $search: q },
        isDeleted: false,
        visibility: 'public'
      };
      
      if (type === 'videos') contentQuery.type = 'video';
      if (type === 'photos') contentQuery.type = 'photo';

      results.videos = await Content.find(contentQuery)
        .sort({ 'stats.views': -1 })
        .limit(10)
        .populate('creator', 'channel.name channel.handle avatar');
    }

    // Search Users/Profiles
    if (type === 'all' || type === 'profiles') {
      results.profiles = await User.find({
        $or: [
          { 'fullName.first': { $regex: q, $options: 'i' } },
          { 'fullName.last': { $regex: q, $options: 'i' } }
        ],
        status: 'active'
      })
      .select('fullName avatar bio followersCount')
      .limit(10);
    }

    // Search Channels
    if (type === 'all' || type === 'channels') {
      results.channels = await User.find({
        $and: [
          { accountType: 'public' },
          { 'channel.isActive': true },
          {
            $or: [
              { 'channel.name': { $regex: q, $options: 'i' } },
              { 'channel.handle': { $regex: q, $options: 'i' } },
              { 'channel.description': { $regex: q, $options: 'i' } }
            ]
          }
        ]
      })
      .select('channel avatar fullName subscriberCount')
      .sort({ 'channel.subscriberCount': -1 })
      .limit(10);
    }

    res.json({ success: true, results, query: q });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Trending/Explore
router.get('/trending', async (req, res) => {
  try {
    const trending = await Content.find({
      'algorithm.trending': true,
      isDeleted: false
    })
    .sort({ 'algorithm.score': -1 })
    .limit(20)
    .populate('creator', 'channel.name channel.handle avatar');

    res.json({ success: true, trending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
