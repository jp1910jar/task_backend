// controllers/projectTaskController.js
const ProjectTask = require("../models/ProjectTask");

// ✅ Create Project Task
exports.createProjectTask = async (req, res) => {
  try {
    const {
      taskName,
      priority,
      status,
      estimate,
      startDate,
      endDate,
      createdBy,
      workspaceId,
    } = req.body;

    if (!taskName || !workspaceId) {
      return res.status(400).json({ message: "taskName and workspaceId are required." });
    }

    // ✅ Auto-generate unique projectId
    const lastTask = await ProjectTask.findOne().sort({ createdAt: -1 });
    const nextId = lastTask
      ? `PRJ-${String(parseInt(lastTask.projectId.split("-")[1]) + 1).padStart(3, "0")}`
      : "PRJ-001";

    const newTask = new ProjectTask({
      projectId: nextId,
      taskName,
      priority,
      status,
      estimate,
      startDate,
      endDate,
      createdBy,
      workspaceId,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating project task:", err);
    res.status(500).json({ message: "Server error" });
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
