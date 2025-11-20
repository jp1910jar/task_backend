const mongoose = require("mongoose");
const Workspace = require("./Workspace"); // import Workspace model

const projectTaskSchema = new mongoose.Schema(
  {
    projectId: { type: String, unique: true }, // WORKSPACENAME-001
    taskName: { type: String, required: true },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    priority: { type: String, default: "Medium" },
    status: { type: String, default: "Pending" },
    estimate: { type: String, default: "" },
    actualHours: { type: String, default: "" }, // new field
    startDate: { type: String, default: "" },
    endDate: { type: String, default: "" },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Auto-generate projectId as WORKSPACENAME-001
projectTaskSchema.pre("save", async function (next) {
  if (!this.projectId) {
    try {
      const workspace = await Workspace.findById(this.workspaceId);
      if (!workspace) throw new Error("Workspace not found");

      const workspaceName = workspace.name.replace(/\s+/g, "-").toUpperCase();

      // Find last task for this workspace
      const lastTask = await mongoose.models.ProjectTask.findOne({ workspaceId: this.workspaceId })
        .sort({ createdAt: -1 })
        .select("projectId");

      let newNumber = 1;
      if (lastTask && lastTask.projectId) {
        const parts = lastTask.projectId.split("-");
        const numPart = parseInt(parts[parts.length - 1], 10);
        newNumber = numPart + 1;
      }

      this.projectId = `${workspaceName}-${String(newNumber).padStart(3, "0")}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("ProjectTask", projectTaskSchema);
