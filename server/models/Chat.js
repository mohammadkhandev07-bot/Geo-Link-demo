const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Chat type
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private'
  },
  
  // Participants
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    lastRead: { type: Date, default: Date.now },
    isMuted: { type: Boolean, default: false }
  }],
  
  // Group info (if group chat)
  groupInfo: {
    name: String,
    description: String,
    avatar: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  
  // Messages
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'file', 'location', 'sticker'],
      default: 'text'
    },
    content: {
      text: String,
      mediaUrl: String,
      fileName: String,
      fileSize: Number,
      location: {
        coordinates: [Number],
        name: String
      },
      replyTo: { type: mongoose.Schema.Types.ObjectId } // Message ID being replied to
    },
    reactions: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      emoji: String
    }],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    readBy: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Last message for preview
  lastMessage: {
    content: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: String,
    createdAt: { type: Date }
  },
  
  // Settings
  settings: {
    isArchived: { type: Boolean, default: false },
    disappearingMessages: { type: Number, default: 0 }, // 0 = off, else hours
    onlyAdminsCanPost: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for fetching user's chats
chatSchema.index({ 'participants.user': 1, updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
