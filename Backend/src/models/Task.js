const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
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
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
    default: 'TODO'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH','URGENT'],
    default: 'MEDIUM'
  },
  assigneeId:{
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
    default: [],
    trim: true
  },
  dueDate: {
    type: Date
  },  
  version: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);