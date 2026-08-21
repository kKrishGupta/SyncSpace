const mongoose = require("mongoose");

const decisionSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true
    },
    rationale: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["PROPOSED", "APPROVED", "REJECTED"],
      default: "PROPOSED"
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Decision", decisionSchema);
