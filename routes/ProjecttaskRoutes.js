// backend/routes/ProjecttaskRoutes.js
const express = require("express");
const router = express.Router();
const ProjectTask = require("../models/ProjectTask");

// ➕ Create Project Task with validation
router.post("/", async (req, res) => {
  try {
    console.log("Incoming ProjectTask POST body:", req.body);

    const { workspaceId, projectName, taskName } = req.body;
    if (!workspaceId || !projectName || !taskName) {
      return res
        .status(400)
        .json({ message: "workspaceId, projectName and taskName are required" });
    }

    const newTask = new ProjectTask(req.body);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    console.error("ProjectTask create error:", err);
    res.status(400).json({ message: err.message });
  }
});

// 📄 Get All Tasks for Workspace (optional filter)
router.get("/:workspaceId", async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { status } = req.query;
    const filter = { workspaceId };
    if (status) filter.status = status;
    const tasks = await ProjectTask.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error("ProjectTask get error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update
router.put("/:id", async (req, res) => {
  try {
    const updated = await ProjectTask.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Project Task not found" });
    res.json(updated);
  } catch (err) {
    console.error("ProjectTask update error:", err);
    res.status(400).json({ message: err.message });
  }
});

// 🗑️ Delete
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ProjectTask.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Project Task not found" });
    res.json({ message: "Project task deleted successfully" });
  } catch (err) {
    console.error("ProjectTask delete error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
