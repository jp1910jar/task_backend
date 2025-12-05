const { v4: uuidv4 } = require("uuid");
const Workgroup = require("../models/Workgroup");
const Member = require("../models/Member");

/* ---------------- Helpers ---------------- */
const normalizeMemberIds = async (selectedIds = []) => {
  const memberIds = [];
  for (const id of selectedIds) {
    if (!id) continue;
    let member = null;
    try { member = await Member.findById(id); } catch {}
    if (member) { memberIds.push(member.memberId); continue; }
    const byMemberId = await Member.findOne({ memberId: id });
    if (byMemberId) memberIds.push(byMemberId.memberId);
  }
  return memberIds;
};

const resolveMemberId = async (maybeId) => {
  if (!maybeId) return null;
  try { const byMongo = await Member.findById(maybeId); if (byMongo) return byMongo.memberId; } catch {}
  const byMemberId = await Member.findOne({ memberId: maybeId });
  if (byMemberId) return byMemberId.memberId;
  return null;
};

const buildMemberDocsForUser = (membersDocs, loggedInMemberId) => membersDocs.map(m => ({
  memberId: m.memberId,
  _id: m._id,
  name: m.name,
  email: m.email,
  phone: m.phone,
  designation: m.designation,
  role: m.role,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
  isCurrent: m.memberId === loggedInMemberId
}));

const buildFullWorkgroupResponse = async (wgDoc, loggedInMember) => {
  const wg = wgDoc.toObject ? wgDoc.toObject() : wgDoc;
  const rawMembers = await Member.find({ memberId: { $in: wg.members } });
  const docs = buildMemberDocsForUser(rawMembers, loggedInMember?.memberId);
  return {
    ...wg,
    members: docs,
    isCreator: wg.createdBy === loggedInMember?.memberId,
    isAdmin: loggedInMember?.role?.toLowerCase() === "admin"
  };
};

/* ---------------- Workgroups ---------------- */
exports.getWorkgroups = async (req, res) => {
  try {
    const user = await Member.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const workgroups = await Workgroup.find({
      $or: [{ createdBy: user.memberId }, { members: user.memberId }]
    }).lean();

    const result = await Promise.all(workgroups.map(async wg => {
      const rawMembers = await Member.find({ memberId: { $in: wg.members } });
      const docs = buildMemberDocsForUser(rawMembers, user.memberId);
      return { ...wg, members: docs, isCreator: wg.createdBy === user.memberId, isAdmin: user.role?.toLowerCase() === "admin" };
    }));

    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

exports.getWorkgroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Member.findOne({ email: req.user.email });
    const wg = await Workgroup.findById(id);
    if (!wg) return res.status(404).json({ message: "Workgroup not found" });
    if (!wg.members.includes(user.memberId) && wg.createdBy !== user.memberId)
      return res.status(403).json({ message: "Access denied" });

    const full = await buildFullWorkgroupResponse(wg, user);
    res.json(full);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

exports.createWorkgroup = async (req, res) => {
  try {
    const { name, description, members = [] } = req.body;
    const normalizedMembers = await normalizeMemberIds(members);
    const creator = await Member.findOne({ email: req.user.email });

    const wg = new Workgroup({ name, description, members: normalizedMembers, createdBy: creator.memberId });
    await wg.save();

    const full = await buildFullWorkgroupResponse(wg, creator);
    full.isCreator = true;
    res.status(201).json(full);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

exports.updateWorkgroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const user = await Member.findOne({ email: req.user.email });
    const wg = await Workgroup.findById(id);
    if (!wg) return res.status(404).json({ message: "Workgroup not found" });

    // ADMIN ONLY
    if (user.role?.toLowerCase() !== "admin")
      return res.status(403).json({ message: "Not allowed" });

    if (name !== undefined) wg.name = name;
    if (description !== undefined) wg.description = description;
    await wg.save();

    const full = await buildFullWorkgroupResponse(wg, user);
    res.json(full);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

exports.deleteWorkgroup = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Member.findOne({ email: req.user.email });
    const wg = await Workgroup.findById(id);
    if (!wg) return res.status(404).json({ message: "Workgroup not found" });

    // ADMIN ONLY
    if (user.role?.toLowerCase() !== "admin")
      return res.status(403).json({ message: "Not allowed" });

    await wg.deleteOne();
    res.json({ message: "Workgroup deleted" });
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

/* ---------------- Workgroup Members ---------------- */
exports.updateWorkgroupMembers = async (req, res) => {
  try {
    const { id, members } = req.body;
    if (!id) return res.status(400).json({ message: "Workgroup ID required" });
    const normalized = await normalizeMemberIds(members);
    const wg = await Workgroup.findById(id);
    if (!wg) return res.status(404).json({ message: "Workgroup not found" });

    // ADMIN ONLY
    const user = await Member.findOne({ email: req.user.email });
    if (user.role?.toLowerCase() !== "admin")
      return res.status(403).json({ message: "Not allowed" });

    wg.members = normalized;
    await wg.save();

    const full = await buildFullWorkgroupResponse(wg, user);
    res.json(full);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

/* ---------------- Workspaces ---------------- */
exports.createWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, members = [] } = req.body;
    const wg = await Workgroup.findById(id);
    if (!wg) return res.status(404).json({ message: "Workgroup not found" });

    const creator = await Member.findOne({ email: req.user.email });
    const normalizedMembers = await normalizeMemberIds(members);
    wg.workspaces.push({ name, description, members: normalizedMembers, createdBy: creator.memberId, createdAt: new Date() });
    await wg.save();

    const full = await buildFullWorkgroupResponse(wg, creator);
    res.status(201).json(full);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

exports.updateWorkspace = async (req, res) => {
  try {
    const { wgId, wsId } = req.params;
    const { name, description, members } = req.body;
    const user = await Member.findOne({ email: req.user.email });
    const wg = await Workgroup.findById(wgId);
    if (!wg) return res.status(404).json({ message: "Workgroup not found" });

    const ws = wg.workspaces.id(wsId);
    if (!ws) return res.status(404).json({ message: "Workspace not found" });

    // ADMIN ONLY
    if (user.role?.toLowerCase() !== "admin")
      return res.status(403).json({ message: "Not allowed" });

    if (name !== undefined) ws.name = name;
    if (description !== undefined) ws.description = description;
    if (Array.isArray(members)) ws.members = await normalizeMemberIds(members);

    await wg.save();
    const full = await buildFullWorkgroupResponse(wg, user);
    res.json(full);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};

exports.deleteWorkspace = async (req, res) => {
  try {
    const { wgId, wsId } = req.params;
    const user = await Member.findOne({ email: req.user.email });
    const wg = await Workgroup.findById(wgId);
    if (!wg) return res.status(404).json({ message: "Workgroup not found" });

    const ws = wg.workspaces.id(wsId);
    if (!ws) return res.status(404).json({ message: "Workspace not found" });

    // ADMIN ONLY
    if (user.role?.toLowerCase() !== "admin")
      return res.status(403).json({ message: "Not allowed" });

    wg.workspaces = wg.workspaces.filter(w => w._id.toString() !== wsId.toString());
    await wg.save();
    const full = await buildFullWorkgroupResponse(wg, user);
    res.json(full);
  } catch (err) { console.error(err); res.status(500).json({ message: "Server error" }); }
};
