const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    action: {
      type: String,
      required: true // e.g., 'CREATED', 'UPDATED', 'DELETED', 'MOVED', 'COMMENTED'
    },
    entityType: {
      type: String,
      required: true, // e.g., 'Task', 'Project', 'Comment', 'File'
      enum: ["Task", "Project", "Comment", "File", "Workspace"]
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Activity", activitySchema);
