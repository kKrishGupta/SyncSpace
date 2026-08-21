const mongoose = require('mongoose');

const workspaceMemberSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  role: {
    type: String,
    enum: ["OWNER", "ADMIN", "MANAGER", "MAINTAINER", "DEVELOPER", "REVIEWER", "MEMBER", "VIEWER"],
    default: "MEMBER"
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE"],
    default: "ACTIVE"
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

workspaceMemberSchema.index(
  { workspaceId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model("WorkspaceMember", workspaceMemberSchema);
