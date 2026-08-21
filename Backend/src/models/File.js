const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    path: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ["FILE", "FOLDER"],
      default: "FILE"
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null
    },
    language: {
      type: String,
      default: "javascript"
    },
    content: {
      type: String,
      default: ""
    },
    size: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: "text/plain"
    },
    storageKey: {
      type: String,
      default: null
    },
    version: {
      type: Number,
      default: 1
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);

fileSchema.index({ projectId: 1, path: 1 }, { unique: true });

module.exports = mongoose.model("File", fileSchema);
