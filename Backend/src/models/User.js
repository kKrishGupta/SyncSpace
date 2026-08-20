const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'AWAY'],
      default: 'OFFLINE'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    lastSeenAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);