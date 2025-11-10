const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  members: [{ type: String }], // store memberId
  createdBy: { type: String, required: true }, // use memberId for creator too
  createdAt: { type: Date, default: Date.now },
});

const workgroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  members: [{ type: String }], // memberId array
  workspaces: [workspaceSchema],
  createdBy: { type: String, required: true }, // memberId of creator
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Workgroup", workgroupSchema);
