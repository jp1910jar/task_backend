// routes/ProjecttaskRoutes.js
const express = require("express");
const router = express.Router();
const {
  createProjectTask,
  getAllProjectTasks,
  updateProjectTask,
  deleteProjectTask,
} = require("../controllers/projectTaskController");

// ✅ Create new project task
router.post("/", createProjectTask);

// ✅ Get all project tasks for a specific workspace
router.get("/:workspaceId", getAllProjectTasks);

// ✅ Update specific project task
router.put("/:id", updateProjectTask);

// ✅ Delete project task
router.delete("/:id", deleteProjectTask);

module.exports = router;
