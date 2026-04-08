const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Content = require('../models/Content');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/upload');

// Upload Content
router.post('/upload', auth, async (req, res) => {
  try {
    const { title, description, type, category, tags, mediaBase64, thumbnailBase64 } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    
    // Only public accounts can upload
    if (user.accountType !== 'public' || !user.channel.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Create a channel to upload content' 
      });
    }

    // Upload media to Cloudinary/AWS
    const mediaResult = await uploadToCloudinary(mediaBase64, type);
    let thumbnailResult = null;
    
    if (thumbnailBase64 && type === 'video') {
      thumbnailResult = await uploadToCloudinary(thumbnailBase64, 'image');
    }

    const content = new Content({
      creator: userId,
      title,
      description,
      type,
      category,
      tags: tags.split(',').map(tag => tag.trim()),
      mediaUrl: mediaResult.url,
      thumbnailUrl: thumbnailResult?.url,
      duration: mediaResult.duration,
      processingStatus: 'ready'
    });

    await content.save();

    res.status(201).json({
      success: true,
      content: {
        id: content._id,
        title: content.title,
        mediaUrl: content.mediaUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Feed (Algorithm-based)
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.userId;

    // Get user's following list
    const user = await User.findById(userId).select('following');
    
    // Fetch content from followed channels + trending + new
    const content = await Content.find({
      $or: [
        { creator: { $in: user.following } },
        { 'algorithm.trending': true },
        { visibility: 'public' }
      ],
      isDeleted: false,
      processingStatus: 'ready'
    })
    .sort({ 'algorithm.score': -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .populate('creator', 'channel.name channel.handle avatar fullName.first');

    res.json({ success: true, content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// View Content (Tracks views and awards points)
router.post('/:id/view', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { watchTime = 0 } = req.body; // How many seconds watched

    const content = await Content.findById(id);
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }

    // Don't count own views
    if (content.creator.toString() === userId) {
      return res.json({ success: true });
    }

    // Check if already viewed by this user (for unique views)
    const alreadyViewed = content.engagementDetails.viewedBy.includes(userId);
    
    if (!alreadyViewed) {
      content.stats.uniqueViews++;
      content.engagementDetails.viewedBy.push(userId);
      
      // Award points to creator for views (5 views = 1 point)
      if (content.stats.views % 5 === 0) {
        const creator = await User.findById(content.creator);
        creator.rewardPoints.current += 1;
        creator.rewardPoints.lifetime += 1;
        creator.pointHistory.push({
          action: 'view_received',
          points: 1,
          contentId: content._id,
          fromUser: userId,
          description: 'View on content'
        });
        await creator.save();
        
        content.rewardPointsGenerated.fromViews += 1;
        content.rewardPointsGenerated.total += 1;
      }
    }

    content.stats.views++;
    content.stats.watchTime += watchTime;
    await content.save();

    // Add to user's watch history
    await User.findByIdAndUpdate(userId, {
      $push: {
        'library.watchHistory': {
          content: id,
          watchedAt: new Date(),
          progress: watchTime
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Like Content
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const content = await Content.findById(id);
    const user = await User.findById(userId);

    const alreadyLiked = content.engagementDetails.likedBy.includes(userId);

    if (alreadyLiked) {
      // Unlike
      content.engagementDetails.likedBy.pull(userId);
      content.stats.likes--;
      
      // Remove from user's liked videos
      user.library.likedVideos.pull(id);
    } else {
      // Like
      content.engagementDetails.likedBy.push(userId);
      content.stats.likes++;
      
      // Add to user's liked videos
      user.library.likedVideos.push(id);
      
      // Award points to creator (1 like = 1 point)
      const creator = await User.findById(content.creator);
      creator.rewardPoints.current += 1;
      creator.rewardPoints.lifetime += 1;
      creator.pointHistory.push({
        action: 'like_received',
        points: 1,
        contentId: content._id,
        fromUser: userId,
        description: 'Like on content'
      });
      await creator.save();
      
      content.rewardPointsGenerated.fromLikes += 1;
      content.rewardPointsGenerated.total += 1;
    }

    await content.save();
    await user.save();

    res.json({ 
      success: true, 
      liked: !alreadyLiked,
      likes: content.stats.likes 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Comment on Content
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    const content = await Content.findById(id);
    
    content.comments.push({
      user: userId,
      text,
      createdAt: new Date()
    });
    
    content.stats.comments++;
    
    // Award points to creator (1 comment = 2 points)
    const creator = await User.findById(content.creator);
    creator.rewardPoints.current += 2;
    creator.rewardPoints.lifetime += 2;
    creator.pointHistory.push({
      action: 'comment_received',
      points: 2,
      contentId: content._id,
      fromUser: userId,
      description: 'Comment on content'
    });
    await creator.save();
    
    content.rewardPointsGenerated.fromComments += 2;
    content.rewardPointsGenerated.total += 2;

    await content.save();

    res.json({ success: true, comment: content.comments[content.comments.length - 1] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Share Content
router.post('/:id/share', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body; // 'copy_link', 'whatsapp', 'facebook', etc.
    const userId = req.userId;

    const content = await Content.findById(id);
    
    content.stats.shares++;
    content.engagementDetails.sharedBy.push(userId);
    
    // Award points to creator (1 share = 5 points)
    const creator = await User.findById(content.creator);
    creator.rewardPoints.current += 5;
    creator.rewardPoints.lifetime += 5;
    creator.pointHistory.push({
      action: 'share_received',
      points: 5,
      contentId: content._id,
      fromUser: userId,
      description: `Share via ${platform}`
    });
    await creator.save();
    
    content.rewardPointsGenerated.fromShares += 5;
    content.rewardPointsGenerated.total += 5;

    await content.save();

    res.json({ success: true, shares: content.stats.shares });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Save to Library
router.post('/:id/save', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { folderName } = req.body; // Optional: save to specific folder
    const userId = req.userId;

    const user = await User.findById(userId);
    const content = await Content.findById(id);

    const alreadySaved = user.library.savedVideos.includes(id);

    if (alreadySaved) {
      // Remove from saved
      user.library.savedVideos.pull(id);
      
      // Remove from folder if exists
      user.library.folders.forEach(folder => {
        folder.contents.pull(id);
      });
    } else {
      // Add to saved
      user.library.savedVideos.push(id);
      
      // Add to folder if specified
      if (folderName) {
        const folder = user.library.folders.find(f => f.name === folderName);
        if (folder) {
          folder.contents.push(id);
        }
      }
      
      content.stats.saves++;
      content.engagementDetails.savedBy.push(userId);
    }

    await user.save();
    await content.save();

    res.json({ success: true, saved: !alreadySaved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download Content (if allowed by creator)
router.post('/:id/download', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const content = await Content.findById(id);
    
    // Check if download is allowed (you can add a field in content schema)
    content.stats.downloads++;
    content.engagementDetails.downloadedBy.push(userId);
    await content.save();

    res.json({ 
      success: true, 
      downloadUrl: content.mediaUrl // In production, generate signed URL
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Folder in Library
router.post('/library/folder', auth, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    await User.findByIdAndUpdate(userId, {
      $push: {
        'library.folders': {
          name,
          contents: [],
          createdAt: new Date()
        }
      }
    });

    res.json({ success: true, message: 'Folder created' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get User's Library
router.get('/library/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('library.savedVideos', 'title thumbnailUrl type creator stats')
      .populate('library.likedVideos', 'title thumbnailUrl type creator stats')
      .populate('library.watchHistory.content', 'title thumbnailUrl type creator');

    res.json({
      success: true,
      library: {
        saved: user.library.savedVideos,
        liked: user.library.likedVideos,
        folders: user.library.folders,
        history: user.library.watchHistory.slice(-50).reverse() // Last 50
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
