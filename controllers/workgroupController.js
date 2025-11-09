const Workgroup = require("../models/Workgroup");
const mongoose = require("mongoose");
const Member = require("../models/Member"); 

// controllers/workgroupController.js
const Workgroup = require("../models/Workgroup");

exports.getWorkgroupById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // 🧠 Fetch the workgroup
    const workgroup = await Workgroup.findOne({
      _id: id,
      $or: [
        { createdBy: userId },
        { members: userId },
        { "workspaces.members": userId },
      ],
    })
      .populate("members", "name email") // populate workgroup members
      .populate("workspaces.members", "name email"); // populate workspace members

    if (!workgroup) {
      return res.status(404).json({ message: "Workgroup not found or access denied" });
    }

    res.status(200).json(workgroup);
  } catch (error) {
    console.error("Error fetching workgroup:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single workgroup
exports.getWorkgroupById = async (req, res) => {
  try {
    const workgroup = await Workgroup.findById(req.params.id)
      .populate("members", "name email")
      .populate("workspaces.members", "name email");

    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });

    const userId = req.user.id;
    const isAllowed = 
      workgroup.createdBy.toString() === userId ||
      workgroup.members.some(m => m._id.toString() === userId);

    if (!isAllowed) return res.status(403).json({ message: "Access denied" });

    res.json(workgroup);
  } catch (err) {
    console.error("getWorkgroupById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Create workgroup
exports.createWorkgroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const userId = req.user.id;

    const workgroup = new Workgroup({
      name,
      description,
      members: members || [],
      createdBy: userId,
    });

    await workgroup.save();

    const populated = await Workgroup.findById(workgroup._id)
      .populate("members", "name email")
      .populate("workspaces.members", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.error("createWorkgroup error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Create workspace inside a workgroup
exports.createWorkspace = async (req, res) => {
  try {
    const { id } = req.params; // workgroup id
    const { name, description, members } = req.body;
    const userId = req.user.id;

    const workgroup = await Workgroup.findById(id);
    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });

    // Only creator or assigned members can add workspace
    const isAllowed =
      workgroup.createdBy.toString() === userId ||
      workgroup.members.some(m => m._id.toString() === userId);

    if (!isAllowed) return res.status(403).json({ message: "Access denied" });

    workgroup.workspaces.push({
      name,
      description,
      members: members || [],
      createdAt: new Date(),
    });

    await workgroup.save();

    const populated = await Workgroup.findById(workgroup._id)
      .populate("members", "name email")
      .populate("workspaces.members", "name email");

    res.status(201).json(populated);
  } catch (err) {
    console.error("createWorkspace error:", err);
    res.status(500).json({ message: err.message });
  }
};
