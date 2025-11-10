const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getWorkgroups,
  getWorkgroupById,
  createWorkgroup,
  updateWorkgroupMembers,
  createWorkspace,
} = require("../controllers/workgroupController");

router.get("/", auth, getWorkgroups);
router.get("/:id", auth, getWorkgroupById);
router.post("/", auth, createWorkgroup);
router.put("/update-members", auth, updateWorkgroupMembers);
router.post("/:id/workspaces", auth, createWorkspace);

module.exports = router;
