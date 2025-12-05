const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const memberSchema = new mongoose.Schema(
  {
    memberId: { type: String, unique: true, default: () => uuidv4() },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    designation: { type: String },
    role: { type: String, default: "member" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);