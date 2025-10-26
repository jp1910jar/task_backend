const Task = require("../models/Task");

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("getTasks error:", err);
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const { name, priority, status, assignedTo, startDate, endDate, estimate } = req.body;

    // Required fields check
    if (!name || !assignedTo) {
      return res.status(400).json({ message: "Task Name and Assigned To are required" });
    }

    const newTask = new Task({
      name,
      priority: priority || "Medium",
      status: status || "Not Started",
      assignedTo,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      estimate: estimate || "",
      createdBy: (req.user && (req.user.name || req.user.id)) || "Admin",
    });

    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: "Failed to create task", error: err.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    Object.assign(task, req.body);
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error("updateTask error:", err);
    res.status(500).json({ message: "Failed to update task", error: err.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
};
