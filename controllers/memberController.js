const Member = require("../models/Member");
const User = require("../models/User");

/**
 * ✅ Get all members + users (without duplication)
 */
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find().lean();
    const users = await User.find({}, "name email role phone").lean();

    // Combine members + users (exclude duplicates)
    const combined = [
      ...members.map(m => ({ ...m, source: "member" })),
      ...users
        .filter(user => !members.some(m => m.email === user.email))
        .map(user => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "N/A",
          designation: "Registered User",
          role: user.role || "member",
          source: "user",
        })),
    ];

    // Disable caching
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json(combined);
  } catch (err) {
    console.error("getMembers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Create new member
 */
exports.createMember = async (req, res) => {
  try {
    const { email } = req.body;
    const existsUser = await User.findOne({ email });
    const existsMember = await Member.findOne({ email });

    if (existsUser || existsMember) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const member = new Member(req.body);
    await member.save();

    return res.status(201).json(member);
  } catch (err) {
    console.error("createMember error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Update Member
 * - If exists in Member → update
 * - If only exists in User → convert to Member and remove user version from frontend
 */
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1️⃣ Try to update member
    let member = await Member.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (member) {
      console.log(`✅ Member updated: ${id}`);
      return res.status(200).json({ data: member, removeOldUser: false });
    }

    // 2️⃣ Not a member → check User
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Member/User not found" });

    // Prevent duplicate email in Member collection
    const exists = await Member.findOne({ email: user.email });
    if (exists)
      return res.status(409).json({ message: "Member already exists with this email" });

    // Create new member
    const newMember = new Member({
      name: updateData.name || user.name,
      email: user.email,
      phone: updateData.phone || user.phone || "",
      designation: updateData.designation || "Registered User",
      role: updateData.role || user.role || "member",
    });
    await newMember.save();

    console.log(`✅ Converted user ${user._id} to member ${newMember._id}`);

    // Tell frontend to remove old user entry instantly
    return res.status(201).json({ data: newMember, removeOldUser: true, oldUserId: user._id });
  } catch (err) {
    console.error("updateMember error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Delete Member
 */
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Member.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Member not found" });
    return res.json({ message: "Member deleted" });
  } catch (err) {
    console.error("deleteMember error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
