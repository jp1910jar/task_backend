const express = require("express");
const router = express.Router();
const {
  getWorkgroups,
  getWorkgroupById,
  createWorkgroup,
  updateWorkgroupMembers,
  createWorkspace,
} = require("../controllers/workgroupController");

// Routes
router.get("/", getWorkgroups);
router.get("/:id", getWorkgroupById);
router.post("/", createWorkgroup);
router.put("/update-members", updateWorkgroupMembers);
router.post("/:id/workspaces", createWorkspace); // ✅ important new route

module.exports = router;
