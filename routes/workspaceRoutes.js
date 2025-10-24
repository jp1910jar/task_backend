// backend/routes/hierarchyRoutes.js
const express = require("express");
const router = express.Router();
const { Workgroup, Workspace, Task } = require("../models/Workspace");

// ---------------- Workgroup ----------------
router.post("/workgroups", async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const wg = new Workgroup({ name, description, members });
    await wg.save();
    res.status(201).json(wg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/workgroups/user/:userId", async (req, res) => {
  try {
    const workgroups = await Workgroup.find({ members: req.params.userId }).populate("members", "name email");
    res.json(workgroups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Workspace ----------------
router.post("/workspaces", async (req, res) => {
  try {
    const { name, description, workgroup, members } = req.body;
    const ws = new Workspace({ name, description, workgroup, members });
    await ws.save();
    res.status(201).json(ws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/workspaces/:workgroupId", async (req, res) => {
  try {
    const workspaces = await Workspace.find({ workgroup: req.params.workgroupId }).populate("members", "name email");
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Task ----------------
router.post("/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/tasks/:workspaceId", async (req, res) => {
  try {
    const tasks = await Task.find({ workspace: req.params.workspaceId }).populate("createdBy", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
