const Workspace = require("../models/Workspace");
const User = require("../models/User");

// GET all workspaces
exports.getWorkspaces = async (req, res) => {
  try {
    let workspaces;
    if (req.user.role === "admin") {
      workspaces = await Workspace.find().populate("members", "name email role");
    } else {
      workspaces = await Workspace.find({ members: req.user.id })
        .populate("members", "name email role");
    }
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE new workspace
exports.createWorkspace = async (req, res) => {
  try {
    const { name, description, color, members } = req.body;
    const workspace = new Workspace({
      name,
      description,
      color,
      createdBy: req.user.id,
      members: members || [],
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD or REMOVE members in workspace
exports.updateMembers = async (req, res) => {
  try {
    const { workspaceId, memberIds } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ message: "Workspace not found" });

    // ✅ Permission check
    if (
      req.user.role !== "admin" &&
      workspace.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ Ensure valid memberIds array
    if (!Array.isArray(memberIds)) {
      return res.status(400).json({ message: "memberIds must be an array" });
    }

    // ✅ Replace members list with new selection (add/remove combined)
    workspace.members = memberIds;

    await workspace.save();

    // ✅ Return populated data to frontend
    const updatedWorkspace = await Workspace.findById(workspaceId)
      .populate("members", "name email role")
      .exec();

    res.json(updatedWorkspace);
  } catch (err) {
    console.error("Error updating members:", err);
    res.status(500).json({ message: err.message });
  }
};
