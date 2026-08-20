const activityService = require("../services/activityService");

exports.getWorkspaceActivity = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const activities = await activityService.getWorkspaceActivity(workspaceId, limit, skip);
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const activities = await activityService.getProjectActivity(projectId, limit, skip);
    res.status(200).json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
