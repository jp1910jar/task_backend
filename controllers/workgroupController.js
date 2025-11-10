const Workgroup = require("../models/Workgroup");
const Member = require("../models/Member");

/**
 * ✅ Helper: Convert selected MongoDB _id to stable memberId
 */
const normalizeMemberIds = async (selectedIds = []) => {
  const memberIds = [];
  for (const id of selectedIds) {
    const member = await Member.findById(id);
    if (member) memberIds.push(member.memberId);
  }
  return memberIds;
};

/**
 * ✅ Get all workgroups visible to logged-in user
 */
exports.getWorkgroups = async (req, res) => {
  try {
    const user = await Member.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const workgroups = await Workgroup.find({
      $or: [
        { createdBy: user.memberId },
        { members: user.memberId }
      ],
    }).lean();

    const workgroupsWithMembers = await Promise.all(
      workgroups.map(async wg => {
        const memberDocs = await Member.find({ memberId: { $in: wg.members } }, "name email phone role");
        return { ...wg, members: memberDocs };
      })
    );

    res.status(200).json(workgroupsWithMembers);
  } catch (err) {
    console.error("getWorkgroups error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Get single workgroup by ID
 */
exports.getWorkgroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Member.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const workgroup = await Workgroup.findById(id).lean();
    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });

    if (workgroup.createdBy !== user.memberId && !workgroup.members.includes(user.memberId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const memberDocs = await Member.find({ memberId: { $in: workgroup.members } }, "name email phone role");
    res.status(200).json({ ...workgroup, members: memberDocs });
  } catch (err) {
    console.error("getWorkgroupById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Create a new workgroup
 */
exports.createWorkgroup = async (req, res) => {
  try {
    const { name, description, members = [] } = req.body;

    const normalizedMemberIds = await normalizeMemberIds(members);
    const creator = await Member.findOne({ email: req.user.email });
    if (!creator) return res.status(404).json({ message: "User not found" });

    const newWorkgroup = new Workgroup({
      name,
      description,
      members: normalizedMemberIds,
      createdBy: creator.memberId,
    });

    await newWorkgroup.save();
    res.status(201).json(newWorkgroup);
  } catch (err) {
    console.error("createWorkgroup error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Update workgroup members
 */
exports.updateWorkgroupMembers = async (req, res) => {
  try {
    const { id, members } = req.body;
    const normalizedMemberIds = await normalizeMemberIds(members);

    const workgroup = await Workgroup.findById(id);
    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });

    workgroup.members = normalizedMemberIds;
    await workgroup.save();

    res.status(200).json(workgroup);
  } catch (err) {
    console.error("updateWorkgroupMembers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Create workspace inside a workgroup
 */
exports.createWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members = [] } = req.body;

    const normalizedMemberIds = await normalizeMemberIds(members);

    const workgroup = await Workgroup.findById(id);
    if (!workgroup) return res.status(404).json({ message: "Workgroup not found" });

    const creator = await Member.findOne({ email: req.user.email });
    if (!creator) return res.status(404).json({ message: "User not found" });

    const workspace = {
      name,
      description,
      members: normalizedMemberIds,
      createdBy: creator.memberId,
    };

    workgroup.workspaces.push(workspace);
    await workgroup.save();

    res.status(201).json(workspace);
  } catch (err) {
    console.error("createWorkspace error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
