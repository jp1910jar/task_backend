// backend/models/Userworkspace.js
const mongoose = require("mongoose");

// ---------------- Workgroup Schema ----------------
const workgroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// ---------------- Workspace Schema ----------------
const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  workgroup: { type: mongoose.Schema.Types.ObjectId, ref: "Workgroup" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// ---------------- Task Schema ----------------
const taskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
  status: { type: String, enum: ["Pending", "In Progress", "Done"], default: "Pending" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace" },
  startDate: Date,
  endDate: Date,
  estimate: String,
  createdAt: { type: Date, default: Date.now },
});

// ---------------- Export Models ----------------
module.exports = {
  Workgroup: mongoose.models.Workgroup || mongoose.model("Workgroup", workgroupSchema),
  Workspace: mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema),
  Task: mongoose.models.Task || mongoose.model("Task", taskSchema),
};
