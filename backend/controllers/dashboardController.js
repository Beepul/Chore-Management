const BaseController = require(".");
const ChoreModel = require("../models/Chore.model");
const MemberModel = require("../models/Member.model");

class DashboardCtrl extends BaseController{
  constructor(){
    super(),
    this.getAdminDashboard = this.getAdminDashboard.bind(this);
    this.getMemberDashboard = this.getMemberDashboard.bind(this);
  }
  async getAdminDashboard(req, res){
    try {
      const currentMembership = await MemberModel.findOne({
        user: req.user._id,
        status: "active",
      });

      if (!currentMembership) {
        return this.sendError(res,  "You do not belong to any household", 400)
      }

      if (currentMembership.role !== "admin") {
        return this.sendError(res, "Only admin can view this dashboard", 403)
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

      return this.sendSuccess(res,
        {
          totalMembers,
          totalChores,
          pendingChores,
          completedChores,
          recentChores,
          recentMembers,
        },
        "Admin dashboard fetched successfully"
      )
    } catch (error) {
      return this.sendError(res, error.message)
    }
  }
  
  async getMemberDashboard (req, res) {
    try {
      const currentMembership = await MemberModel.findOne({
        user: req.user._id,
        status: "active",
      }).populate("household", "name");

      if (!currentMembership) {
        return this.sendError(res, "You do not belong to any household", 400 )
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

      return this.sendSuccess(res,
        {
          householdName: currentMembership.household.name,
          totalAssignedChores,
          pendingChores,
          inProgressChores,
          completedChores,
          assignedChores,
          upcomingChores,
        },
        "Member dashboard fetched successfully"
      )
    } catch (error) {
      return this.sendError(res, error.message)
    }
  };
}


module.exports = new DashboardCtrl;