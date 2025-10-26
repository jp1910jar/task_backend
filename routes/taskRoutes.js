const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const verifyToken = require("../middleware/auth"); // optional, keep for dev

// All task routes
router.get("/", verifyToken, taskController.getTasks);
router.post("/", verifyToken, taskController.createTask);
router.put("/:id", verifyToken, taskController.updateTask);
router.delete("/:id", verifyToken, taskController.deleteTask);

module.exports = router;
