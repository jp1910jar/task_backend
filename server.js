const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Use only this single CORS setup
app.use(
  cors({
    origin: "http://localhost:5173", // your React frontend port
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
const workgroupRoutes = require("./routes/workgroupRoutes");
app.use("/api/workgroups", workgroupRoutes);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "ProjectManagement",
  })
  .then(async () => {
    console.log("MongoDB connected");

    const User = require("./models/User");
    const adminEmail = "jitendrabuddha@gmail.com";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("987654321_j", 10);
      await new User({
        username: "jitendrabuddha",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      }).save();
      console.log("Admin created");
    }
  })
  .catch((err) => console.log("MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
