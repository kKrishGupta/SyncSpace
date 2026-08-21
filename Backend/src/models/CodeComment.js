const mongoose = require("mongoose");

const codeCommentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
      index: true
    },
    line: {
      type: Number,
      required: true
    },
    lineEnd: {
      type: Number,
      default: null
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN"
    },
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CodeComment",
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("CodeComment", codeCommentSchema);
