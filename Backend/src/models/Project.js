const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true
  },

  name :{
    type : String,
    required : true,
    trim : true
  },
  key:{
    type : String,
    required : true,
    uppercase : true,
    trim : true
  },
  description:{
    type : String,
    trim : true,
    default:''
  },
  
  ownerId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : "User",
    required : true
  },
  status:{
    type : String,
    enum : ["ACTIVE","INACTIVE"],
    default : "ACTIVE"
  },

},{
  timestamps : true
});

projectSchema.index(
  {workspaceId: 1, key: 1},
  { unique: true }
);
module.exports = mongoose.model("Project", projectSchema);