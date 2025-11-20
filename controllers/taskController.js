const Task = require("../models/Task");

// Convert HH:MM string to minutes
const hhmmToMinutes = (str) => {
  if (!str) return 0;
  const parts = str.split(":");
  if (parts.length !== 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
};

// Convert minutes to HH:MM string
const minutesToHHMM = (minutes) => {
  if (!minutes || isNaN(minutes)) return "0:00";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
};

// GET tasks
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== "admin") {
      const userIdentifier = req.user.email || req.user.name || req.user.id;
      query = { $or: [{ assignedTo: userIdentifier }, { createdBy: userIdentifier }] };
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("getTasks error:", err);
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
};

// CREATE task
exports.createTask = async (req, res) => {
  try {
    const { name, priority, status, assignedTo, startDate, endDate, estimate, actualTime } = req.body;
    if (!name || !assignedTo) return res.status(400).json({ message: "Task Name and Assigned To are required" });

    const createdBy = req.user?.email || req.user?.name || "Admin";

    const newTask = new Task({
      name,
      priority: priority || "Medium",
      status: status || "Not Started",
      assignedTo,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      estimate: hhmmToMinutes(estimate),
      actualTime: hhmmToMinutes(actualTime),
      createdBy,
    });

    const savedTask = await newTask.save();
    res.json(savedTask);
  } catch (err) {
    console.error("createTask error:", err);
    res.status(500).json({ message: "Failed to create task", error: err.message });
  }
};

// UPDATE task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin") {
      const userIdentifier = req.user.email || req.user.name;
      if (task.createdBy !== userIdentifier && task.assignedTo !== userIdentifier) {
        return res.status(403).json({ message: "Not authorized to edit this task" });
      }
    }

    const { name, priority, status, assignedTo, startDate, endDate, estimate, actualTime } = req.body;

    task.name = name ?? task.name;
    task.priority = priority ?? task.priority;
    task.status = status ?? task.status;
    task.assignedTo = assignedTo ?? task.assignedTo;
    task.startDate = startDate ? new Date(startDate) : task.startDate;
    task.endDate = endDate ? new Date(endDate) : task.endDate;
    task.estimate = estimate ? hhmmToMinutes(estimate) : task.estimate;
    task.actualTime = actualTime ? hhmmToMinutes(actualTime) : task.actualTime;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error("updateTask error:", err);
    res.status(500).json({ message: "Failed to update task", error: err.message });
  }
};

// DELETE task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin") {
      const userIdentifier = req.user.email || req.user.name;
      if (task.createdBy !== userIdentifier) return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("deleteTask error:", err);
    res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
};
