const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    storageKey: {
      type: String,
      required: true // Path or S3 key
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project"
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("File", fileSchema);
