const express = require("express");
const router = express.Router();

const Member = require("../models/Member");
const Task = require("../models/Task");
const Workgroup = require("../models/Workgroup");
const Workspace = require("../models/Workspace");
const ProjectTask = require("../models/ProjectTask"); // if you have it

router.get("/stats", async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalWorkgroups = await Workgroup.countDocuments();
    const totalWorkspaces = await Workspace.countDocuments();
    const totalProjectTasks = await ProjectTask.countDocuments();

    // Optional: Count by status for chart
    const taskStatus = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const projectTaskStatus = await ProjectTask.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      members: totalMembers,
      tasks: totalTasks,
      workgroups: totalWorkgroups,
      workspaces: totalWorkspaces,
      projectTasks: totalProjectTasks,
      taskStatus,
      projectTaskStatus,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
});

module.exports = router;
