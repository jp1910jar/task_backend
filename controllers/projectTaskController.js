// controllers/projectTaskController.js
const ProjectTask = require("../models/ProjectTask");
const Workgroup = require("../models/Workgroup"); // your workgroup model

// ✅ Create Project Task
exports.createProjectTask = async (req, res) => {
  try {
    const {
      taskName,
      priority,
      status,
      estimate,
      actualHours,
      startDate,
      endDate,
      createdBy,
      workspaceId,
    } = req.body;

    if (!taskName || !workspaceId || !createdBy) {
      return res
        .status(400)
        .json({ message: "taskName, workspaceId, and createdBy are required." });
    }

    // 🔹 Find workspace inside workgroups
    const workgroup = await Workgroup.findOne({ "workspaces._id": workspaceId });
    if (!workgroup) return res.status(404).json({ message: "Workspace not found" });

    // 🔹 Get workspace name for projectId
    const workspace = workgroup.workspaces.id(workspaceId);
    const workspaceName = workspace.name.replace(/\s+/g, "-"); // remove spaces for ID

    // 🔹 Generate sequential projectId like workspaceName-001
    const lastTask = await ProjectTask.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(1);

    let nextNumber = 1;
    if (lastTask.length > 0) {
      const lastId = lastTask[0].projectId;
      const parts = lastId.split("-");
      const numPart = parseInt(parts[parts.length - 1]);
      if (!isNaN(numPart)) nextNumber = numPart + 1;
    }

    const projectId = `${workspaceName}-${String(nextNumber).padStart(3, "0")}`;

    // 🔹 Create new project task
    const newTask = new ProjectTask({
      projectId,
      taskName,
      priority,
      status,
      estimate,
      actualHours,
      startDate,
      endDate,
      createdBy,
      workspaceId,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating project task:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get all Project Tasks for a specific workspace
exports.getAllProjectTasks = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { status } = req.query;

    let query = { workspaceId };
    if (status) query.status = status;

    const tasks = await ProjectTask.find(query).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Error fetching project tasks:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Project Task
exports.updateProjectTask = async (req, res) => {
  try {
    const updatedTask = await ProjectTask.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Error updating project task:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Delete Project Task
exports.deleteProjectTask = async (req, res) => {
  try {
    const deletedTask = await ProjectTask.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting project task:", err);
    res.status(500).json({ message: "Server error" });
  }
};
