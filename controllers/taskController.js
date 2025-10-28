const Task = require("../models/Task");

// Get tasks (Admin sees all; user sees their own or assigned)
exports.getTasks = async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== "admin") {
      // Normal user: show tasks assigned to them OR created by them
      const userIdentifier = req.user.email || req.user.name || req.user.id;
      query = {
        $or: [
          { assignedTo: userIdentifier },
          { createdBy: userIdentifier }
        ]
      };
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
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

    if (!name || !assignedTo) {
      return res.status(400).json({ message: "Task Name and Assigned To are required" });
    }

    const createdBy = req.user?.email || req.user?.name || "Admin";

    const newTask = new Task({
      name,
      priority: priority || "Medium",
      status: status || "Not Started",
      assignedTo,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      estimate: estimate || "",
      createdBy,
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

    // Optional: Prevent normal users from editing others’ tasks
    if (req.user.role !== "admin") {
      const userIdentifier = req.user.email || req.user.name;
      if (task.createdBy !== userIdentifier && task.assignedTo !== userIdentifier) {
        return res.status(403).json({ message: "Not authorized to edit this task" });
      }
    }

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
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Optional: Restrict deletion rights
    if (req.user.role !== "admin") {
      const userIdentifier = req.user.email || req.user.name;
      if (task.createdBy !== userIdentifier) {
        return res.status(403).json({ message: "Not authorized to delete this task" });
      }
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
};
