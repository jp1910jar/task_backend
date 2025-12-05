const express = require("express");
const router = express.Router();
const workgroupController = require("../controllers/workgroupController");
const authMiddleware = require("../middleware/auth");

/* Workgroup Members (PUT this FIRST before any :id routes) */
router.put("/members", authMiddleware, workgroupController.updateWorkgroupMembers);

/* Workgroups */
router.get("/", authMiddleware, workgroupController.getWorkgroups);
router.post("/", authMiddleware, workgroupController.createWorkgroup);
router.get("/:id", authMiddleware, workgroupController.getWorkgroupById);
router.put("/:id", authMiddleware, workgroupController.updateWorkgroup);
router.delete("/:id", authMiddleware, workgroupController.deleteWorkgroup);

/* Workspaces */
router.post("/:id/workspaces", authMiddleware, workgroupController.createWorkspace);
router.put("/:wgId/workspaces/:wsId", authMiddleware, workgroupController.updateWorkspace);
router.delete("/:wgId/workspaces/:wsId", authMiddleware, workgroupController.deleteWorkspace);

module.exports = router;
