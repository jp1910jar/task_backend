const mongoose = require("mongoose");
const Workgroup = require("../models/Workgroup");
const Member = require("../models/Member");
const User = require("../models/User");

// ---------------- Helper: convert any selected member/user to Member _id ----------------
const resolveMemberIds = async (selectedIds) => {
  const memberIds = [];

  for (const id of selectedIds) {
    // 1️⃣ Check if it's already a Member
    let member = await Member.findById(id);
    if (member) {
      memberIds.push(member._id);
      continue;
    }

    // 2️⃣ Check if it's a User
    const user = await User.findById(id);
    if (user) {
      // Check if already exists in Member collection
      member = await Member.findOne({ email: user.email });
      if (!member) {
        member = await Member.create({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          designation: "Registered User",
          role: user.role || "member",
        });
      }
      memberIds.push(member._id);
      continue;
    }

    console.warn(`⚠️ Member/User with ID ${id} not found`);
  }

  return memberIds;
};

// ---------------- Get all workgroups for logged-in user ----------------
exports.getWorkgroups = async (req, res) => {
  try {
    const userIdStr = req.user.id.toString();

    const workgroups = await Workgroup.find({
      $or: [
        { createdBy: userIdStr },
        { members: userIdStr }
      ]
    })
      .populate("members", "name email")
      .populate("workspaces.members", "name email");

    const filtered = workgroups.map(wg => {
      if (wg.createdBy.toString() !== userIdStr) {
        const visibleWorkspaces = wg.workspaces.filter(ws =>
          ws.members.some(m => m._id.toString() === userIdStr)
        );
        return { ...wg.toObject(), workspaces: visibleWorkspaces };
      }
      return wg;
    });

    res.json(filtered);
  } catch (err) {
    console.error("getWorkgroups error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Get single workgroup ----------------
exports.getWorkgroupById = async (req, res) => {
  try {
    const workgroup = await Workgroup.findById(req.params.id)
      .populate("members", "name email")
      .populate("workspaces.members", "name email");

    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });

    const userIdStr = req.user.id.toString();
    const isAllowed =
      workgroup.createdBy.toString() === userIdStr ||
      workgroup.members.some(m => m._id.toString() === userIdStr);

    if (!isAllowed) return res.status(403).json({ message: "Access denied" });

    let filteredWorkgroup = workgroup.toObject();
    if (workgroup.createdBy.toString() !== userIdStr) {
      filteredWorkgroup.workspaces = workgroup.workspaces.filter(ws =>
        ws.members.some(m => m._id.toString() === userIdStr)
      );
    }

    res.json(filteredWorkgroup);
  } catch (err) {
    console.error("getWorkgroupById error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ---------------- Create new workgroup ----------------
exports.createWorkgroup = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const memberIds = await resolveMemberIds(members || []);

    const workgroup = new Workgroup({
      name,
      description,
      members: memberIds,
      createdBy: req.user.id,
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

// ---------------- Create workspace inside workgroup ----------------
exports.createWorkspace = async (req, res) => {
  try {
    const { id } = req.params; // workgroup ID
    const { name, description, members } = req.body;

    const workgroup = await Workgroup.findById(id);
    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });

    const userIdStr = req.user.id.toString();
    const isAllowed =
      workgroup.createdBy.toString() === userIdStr ||
      workgroup.members.some(m => m._id.toString() === userIdStr);

    if (!isAllowed) return res.status(403).json({ message: "Access denied" });

    const workspaceMemberIds = await resolveMemberIds(members || []);

    workgroup.workspaces.push({
      name,
      description,
      members: workspaceMemberIds,
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
