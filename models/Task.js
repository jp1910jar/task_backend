const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Review", "On Hold", "Closed", "Cancelled"],
      default: "Not Started",
    },
    assignedTo: { type: String, required: true },
    startDate: String,
    endDate: String,
    estimate: String,
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
