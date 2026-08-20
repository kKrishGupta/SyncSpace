const Activity = require("../models/Activity");

class ActivityService {
  async logActivity({ workspaceId, projectId, actorId, action, entityType, entityId, metadata }) {
    try {
      const activity = await Activity.create({
        workspaceId,
        projectId,
        actorId,
        action,
        entityType,
        entityId,
        metadata
      });
      return activity;
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  }

  async getWorkspaceActivity(workspaceId, limit = 50, skip = 0) {
    return await Activity.find({ workspaceId })
      .populate('actorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async getProjectActivity(projectId, limit = 50, skip = 0) {
    return await Activity.find({ projectId })
      .populate('actorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}

module.exports = new ActivityService();
