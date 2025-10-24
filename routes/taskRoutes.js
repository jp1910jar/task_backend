const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const taskController = require("../controllers/taskController");

router.get("/", verifyToken, taskController.getTasks);
router.post("/", verifyToken, taskController.createTask);
router.put("/:id", verifyToken, taskController.updateTask);
router.delete("/:id", verifyToken, taskController.deleteTask);

module.exports = router;
