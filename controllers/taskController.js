const Task = require("../models/Task");

// GET tasks (role-based)
exports.getTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === "admin") {
      tasks = await Task.find();
    } else {
      tasks = await Task.find({
        $or: [{ assignedTo: req.user.id }, { createdBy: req.user.id }],
      });
    }
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE task
exports.createTask = async (req, res) => {
  try {
    let { name, priority, status, assignedTo, startDate, endDate, estimate } = req.body;

    const allowedStatus = ["Not Started","In Progress","Review","On Hold","Closed","Cancelled"];
    const allowedPriority = ["High","Medium","Low"];

    if (!allowedStatus.includes(status)) status = "Not Started";
    if (!allowedPriority.includes(priority)) priority = "Medium";

    if (!assignedTo || !name) {
      return res.status(400).json({ message: "Task name and assignedTo are required" });
    }

    const newTask = new Task({
      name,
      priority,
      status,
      assignedTo,
      startDate,
      endDate,
      estimate,
      createdBy: req.user.id,
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    let { name, priority, status, assignedTo, startDate, endDate, estimate } = req.body;

    const allowedStatus = ["Not Started","In Progress","Review","On Hold","Closed","Cancelled"];
    const allowedPriority = ["High","Medium","Low"];

    if (!allowedStatus.includes(status)) status = "Not Started";
    if (!allowedPriority.includes(priority)) priority = "Medium";

    Object.assign(task, { name, priority, status, assignedTo, startDate, endDate, estimate });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "admin" && task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
