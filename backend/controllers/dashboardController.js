const ChoreModel = require("../models/Chore.model");
const MemberModel = require("../models/Member.model");


const getAdminDashboard = async (req, res) => {
  try {
    const currentMembership = await MemberModel.findOne({
      user: req.user._id,
      status: "active",
    });

    if (!currentMembership) {
      return res.status(400).json({
        message: "You do not belong to any household",
      });
    }

    if (currentMembership.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can view this dashboard",
      });
    }

    const householdId = currentMembership.household;

    const totalMembers = await MemberModel.countDocuments({
      household: householdId,
      status: "active",
    });

    const totalChores = await ChoreModel.countDocuments({
      household: householdId,
    });

    const pendingChores = await ChoreModel.countDocuments({
      household: householdId,
      status: "pending",
    });

    const completedChores = await ChoreModel.countDocuments({
      household: householdId,
      status: "completed",
    });

    const recentChores = await ChoreModel.find({
      household: householdId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMembers = await MemberModel.find({
      household: householdId,
      status: "active",
    })
      .populate("user", "fullname email")
      .sort({ joinedAt: -1 })
      .limit(5);

    return res.status(200).json({
      data: {
        totalMembers,
        totalChores,
        pendingChores,
        completedChores,
        recentChores,
        recentMembers,
      },
      message: "Admin dashboard fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getMemberDashboard = async (req, res) => {
  try {
    const currentMembership = await MemberModel.findOne({
      user: req.user._id,
      status: "active",
    }).populate("household", "name");

    if (!currentMembership) {
      return res.status(400).json({
        message: "You do not belong to any household",
      });
    }

    const householdId = currentMembership.household._id;
    const userId = req.user._id;

    const totalAssignedChores = await ChoreModel.countDocuments({
      household: householdId,
      assignedTo: userId,
    });

    const pendingChores = await ChoreModel.countDocuments({
      household: householdId,
      assignedTo: userId,
      status: "pending",
    });

    const inProgressChores = await ChoreModel.countDocuments({
      household: householdId,
      assignedTo: userId,
      status: "in_progress",
    });

    const completedChores = await ChoreModel.countDocuments({
      household: householdId,
      assignedTo: userId,
      status: "completed",
    });

    const assignedChores = await ChoreModel.find({
      household: householdId,
      assignedTo: userId,
    })
      .populate("parentChore", "title")
      .sort({ createdAt: -1 })
      .limit(8);

    const upcomingChores = await ChoreModel.find({
      household: householdId,
      assignedTo: userId,
      status: { $ne: "completed" },
      dueDate: { $ne: null },
    })
      .sort({ dueDate: 1 })
      .limit(5);

    return res.status(200).json({
      data: {
        householdName: currentMembership.household.name,
        totalAssignedChores,
        pendingChores,
        inProgressChores,
        completedChores,
        assignedChores,
        upcomingChores,
      },
      message: "Member dashboard fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { getAdminDashboard, getMemberDashboard };