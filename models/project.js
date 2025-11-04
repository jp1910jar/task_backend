const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Planning", "In Progress", "Completed"],
      default: "Planning",
    },
    // If your system has workgroups/workspaces, link them here
    workgroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workgroup",
      default: null,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // optional for now
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
