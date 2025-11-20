// controllers/dashboardController.js
const Member = require("../models/Member");
const Task = require("../models/Task");
const Workgroup = require("../models/Workgroup");
const ProjectTask = require("../models/ProjectTask");

exports.getDashboardStats = async (req, res) => {
  try {
    // Fetch members and tasks
    const members = await Member.find().lean();
    const tasks = await Task.find().lean();
    const projectTasks = await ProjectTask.find().lean();
    const workgroups = await Workgroup.find().lean();

    // Calculate total actual hours per member
    const membersWithHours = members.map((member) => {
      const memberTasks = tasks.filter(task => task.createdBy === member.email);
      const totalActualHours = memberTasks.reduce((sum, t) => sum + (t.actualTime || 0), 0);

      return { ...member, totalActualHours };
    });

    // Calculate task status counts
    const taskStatus = ["Not Started", "In Progress", "Completed"].map(status => ({
      _id: status,
      count: tasks.filter(t => t.status === status).length
    }));

    // Calculate project task status counts
    const projectTaskStatus = ["Planning", "In Progress", "Completed"].map(status => ({
      _id: status,
      count: projectTasks.filter(t => t.status === status).length
    }));

    res.json({
      members: membersWithHours,
      tasks,
      workgroups: workgroups.length,
      projectTasks: projectTasks.length,
      taskStatus,
      projectTaskStatus
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
