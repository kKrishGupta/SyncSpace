const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
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
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "TODO",
        "IN_PROGRESS",
        "IN_REVIEW",
        "DONE"
      ],
      default: "TODO",
      index: true
    },

    priority: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT"
      ],
      default: "MEDIUM"
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    labels: {
      type: [String],
      default: []
    },

    dueDate: {
      type: Date,
      default: null
    },

    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    }
  },

  {
    timestamps: true
  }
);


taskSchema.index({
  projectId: 1,
  status: 1
});


module.exports =
  mongoose.model("Task", taskSchema);