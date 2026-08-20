const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

exports.globalSearch = async (req, res) => {
  try {
    const { q, workspaceId } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: "Query too short" });
    }

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "Workspace ID required for search" });
    }

    const regex = new RegExp(q, 'i');

    const [tasks, projects, members] = await Promise.all([
      Task.find({ workspaceId, $or: [{ title: regex }, { description: regex }] }).limit(5).select('title status projectId'),
      Project.find({ workspaceId, $or: [{ name: regex }, { description: regex }] }).limit(5).select('name key'),
      // For members, we just search users globally for simplicity. 
      // Ideally, we'd search WorkSpaceMember but that requires a join.
      User.find({ name: regex }).limit(5).select('name email avatar')
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        projects,
        members
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
