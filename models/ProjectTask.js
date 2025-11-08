const mongoose = require("mongoose");

const projectTaskSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    projectId: { type: String, unique: true },
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

// 🧩 Auto-generate projectId like PRJ-001
projectTaskSchema.pre("save", async function (next) {
  if (this.projectId) return next();

  try {
    const count = await mongoose.model("ProjectTask").countDocuments();
    this.projectId = `PRJ-${(count + 1).toString().padStart(3, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("ProjectTask", projectTaskSchema);
