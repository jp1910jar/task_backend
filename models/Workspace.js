const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  workgroup: { type: mongoose.Schema.Types.ObjectId, ref: "Workgroup" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Workspace", workspaceSchema);
