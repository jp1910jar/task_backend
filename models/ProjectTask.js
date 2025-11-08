// models/ProjectTask.js
const mongoose = require("mongoose");

const projectTaskSchema = new mongoose.Schema(
  {
    projectId: { type: String, unique: true }, // Auto-generated unique ID
    taskName: { type: String, required: true },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    priority: { type: String, default: "Medium" },
    status: { type: String, default: "Pending" },
    estimate: { type: String, default: "" },
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Auto-generate a unique sequential projectId before saving
projectTaskSchema.pre("save", async function (next) {
  if (!this.projectId) {
    try {
      const lastTask = await mongoose.models.ProjectTask.findOne()
        .sort({ createdAt: -1 })
        .select("projectId");

      let newId = 1;
      if (lastTask && lastTask.projectId) {
        const numPart = parseInt(lastTask.projectId.replace("PRJ-", ""));
        newId = numPart + 1;
      }

      this.projectId = `PRJ-${String(newId).padStart(3, "0")}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("ProjectTask", projectTaskSchema);
