const mongoose = require("mongoose");

// Remove cached model in dev
// if (mongoose.models.Task) {
//   delete mongoose.models.Task;
// }

const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priority: { type: String, default: "Medium" }, // free-text
    status: { 
      type: String, 
      default: "Not Started" // any string is allowed
    },
    assignedTo: { type: String, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    estimate: { type: String },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
