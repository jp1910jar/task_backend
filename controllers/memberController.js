const Member = require("../models/Member");
const User = require("../models/User"); // ✅ import User model

// GET all members + users
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find();
    const users = await User.find({}, "name email role"); // ✅ limit fields

    // Merge both collections (avoid duplicates by email)
    const combined = [...members];
    users.forEach((user) => {
      const exists = members.some((m) => m.email === user.email);
      if (!exists) {
        combined.push({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "N/A",
          designation: "Registered User",
          role: user.role || "member",
        });
      }
    });

    res.json(combined);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE member
exports.createMember = async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE member
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE member
exports.deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
