const File = require("../models/File");
const path = require("path");

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const { workspaceId, projectId, taskId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ success: false, message: "Workspace ID is required" });
    }

    const file = await File.create({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      storageKey: `/uploads/${req.file.filename}`,
      uploadedBy: req.user._id,
      workspaceId,
      projectId,
      taskId
    });

    res.status(201).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const { taskId, projectId, workspaceId } = req.query;
    
    let query = {};
    if (taskId) query.taskId = taskId;
    else if (projectId) query.projectId = projectId;
    else if (workspaceId) query.workspaceId = workspaceId;
    else return res.status(400).json({ success: false, message: "Provide taskId, projectId, or workspaceId" });

    const files = await File.find(query)
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
