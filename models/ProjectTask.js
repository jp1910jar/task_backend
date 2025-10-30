const mongoose = require("mongoose");

const projectTaskSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    projectName: { type: String, required: true },
    taskName: { type: String, required: true },
    priority: { type: String, default: "Medium" },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Review", "On Hold", "Closed", "Cancelled"],
      default: "Not Started",
    },
    createdBy: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    estimate: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProjectTask", projectTaskSchema);
