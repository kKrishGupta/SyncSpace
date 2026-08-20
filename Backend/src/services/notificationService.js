const Notification = require("../models/Notification");
const { getIo } = require("../websocket/websocketServer"); // assuming this exists, we will check

class NotificationService {
  async createNotification({ recipientId, actorId, type, entityId, entityType, message }) {
    const notification = await Notification.create({
      recipientId,
      actorId,
      type,
      entityId,
      entityType,
      message
    });

    const populatedNotification = await Notification.findById(notification._id)
      .populate('actorId', 'name avatar')
      .lean();

    // Emit via WebSocket to specific user
    try {
      const io = getIo();
      io.to(`user:${recipientId.toString()}`).emit('new_notification', populatedNotification);
    } catch (error) {
      console.error("Failed to emit notification via WebSocket:", error);
    }

    return populatedNotification;
  }

  async getNotifications(userId, limit = 20, skip = 0) {
    return await Notification.find({ recipientId: userId })
      .populate('actorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async markAsRead(userId, notificationId) {
    if (notificationId) {
      return await Notification.findOneAndUpdate(
        { _id: notificationId, recipientId: userId },
        { read: true },
        { new: true }
      );
    } else {
      // Mark all as read
      return await Notification.updateMany(
        { recipientId: userId, read: false },
        { read: true }
      );
    }
  }
}

module.exports = new NotificationService();
