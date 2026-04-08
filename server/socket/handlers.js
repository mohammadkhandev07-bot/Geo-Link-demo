const User = require('../models/User');
const Chat = require('../models/Chat');

module.exports = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins with their userId
    socket.on('join', async (userId) => {
      onlineUsers.set(userId, socket.id);
      
      // Update user status
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        socketId: socket.id,
        lastActive: new Date()
      });
      
      // Broadcast online status to friends
      socket.broadcast.emit('userOnline', userId);
      
      // Join personal room for notifications
      socket.join(`user_${userId}`);
    });

    // Typing indicator
    socket.on('typing', ({ chatId, userId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit('typing', { userId, isTyping });
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const { chatId, message, senderId } = data;
        
        // Save message to database
        const chat = await Chat.findByIdAndUpdate(
          chatId,
          {
            $push: {
              messages: {
                sender: senderId,
                type: message.type || 'text',
                content: message.content,
                createdAt: new Date()
              }
            },
            $set: {
              lastMessage: {
                content: message.type === 'text' ? message.content.text : `[${message.type}]`,
                sender: senderId,
                type: message.type,
                createdAt: new Date()
              }
            }
          },
          { new: true }
        ).populate('participants.user');

        // Get the new message
        const newMessage = chat.messages[chat.messages.length - 1];

        // Notify participants
        chat.participants.forEach(participant => {
          if (participant.user._id.toString() !== senderId) {
            const recipientSocketId = onlineUsers.get(participant.user._id.toString());
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('newMessage', {
                chatId,
                message: newMessage
              });
              
              // Send notification
              io.to(`user_${participant.user._id}`).emit('notification', {
                type: 'message',
                title: 'New Message',
                body: `You have a new message`,
                data: { chatId }
              });
            }
          }
        });

        // Confirm to sender
        socket.emit('messageSent', { chatId, message: newMessage });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Join chat room
    socket.on('joinChat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    // Leave chat room
    socket.on('leaveChat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Location sharing (for map feature)
    socket.on('shareLocation', async ({ userId, location }) => {
      // Update user location
      await User.findByIdAndUpdate(userId, {
        'location.coordinates': [location.lng, location.lat],
        lastActive: new Date()
      });
      
      // Notify nearby friends (simplified - in production, use geospatial query)
      socket.broadcast.emit('locationUpdate', { userId, location });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      // Find user by socket id
      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);
        
        await User.findByIdAndUpdate(disconnectedUserId, {
          isOnline: false,
          lastActive: new Date()
        });
        
        socket.broadcast.emit('userOffline', disconnectedUserId);
      }
      
      console.log('User disconnected:', socket.id);
    });
  });
};
