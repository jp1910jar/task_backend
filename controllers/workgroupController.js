const Workgroup = require("../models/Workgroup");
const User = require("../models/User");

// ✅ Get all workgroups
exports.getWorkgroups = async (req, res) => {
  try {
    const workgroups = await Workgroup.find()
      .populate("members", "name email")
      .populate("workspaces.members", "name email");
    res.json(workgroups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get a single workgroup by ID
exports.getWorkgroupById = async (req, res) => {
  try {
    const workgroup = await Workgroup.findById(req.params.id)
      .populate("members", "name email")
      .populate("workspaces.members", "name email");

    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });
    res.json(workgroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Create a new workgroup
exports.createWorkgroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;
    const newGroup = new Workgroup({ name, description, members });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update workgroup members
exports.updateWorkgroupMembers = async (req, res) => {
  try {
    const { workgroupId, members } = req.body;
    const updated = await Workgroup.findByIdAndUpdate(
      workgroupId,
      { members },
      { new: true }
    ).populate("members", "name email");

    if (!updated) return res.status(404).json({ message: "Workgroup not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Create workspace inside a workgroup
exports.createWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members } = req.body;

    const workgroup = await Workgroup.findById(id);
    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });

    const newWorkspace = {
      name,
      description,
      members: members || [],
      createdAt: new Date(),
    };

    if (!workgroup.workspaces) workgroup.workspaces = [];
    workgroup.workspaces.push(newWorkspace);

    await workgroup.save();
    res.status(201).json(workgroup);
  } catch (err) {
    console.error("Error creating workspace:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ NEW — Get a single workspace by its ID (for ProjectTask header)
exports.getWorkspaceById = async (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;

    // Find the workgroup that contains this workspace
    const workgroup = await Workgroup.findOne(
      { "workspaces._id": workspaceId },
      { "workspaces.$": 1 }
    );

    if (!workgroup) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const workspace = workgroup.workspaces[0];
    res.json(workspace);
  } catch (err) {
    console.error("Error fetching workspace:", err);
    res.status(500).json({ message: "Server error fetching workspace" });
  }
};
