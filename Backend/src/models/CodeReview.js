const mongoose = require("mongoose");

const codeReviewSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true
    },
    reviewNumber: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ["OPEN", "CHANGES_REQUESTED", "APPROVED", "MERGED", "CLOSED"],
      default: "OPEN"
    },
    changedFiles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "File"
      }
    ],
    additions: {
      type: Number,
      default: 0
    },
    deletions: {
      type: Number,
      default: 0
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null
    }
  },
  {
    timestamps: true
  }
);

codeReviewSchema.index({ projectId: 1, reviewNumber: 1 }, { unique: true });

module.exports = mongoose.model("CodeReview", codeReviewSchema);
