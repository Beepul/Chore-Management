const BaseController = require(".");
const MemberModel = require("../models/Member.model");


class MemberCtrl extends BaseController{
  constructor(){
    super()
    this.getMembers = this.handleAsync(this.getMembers.bind(this));
    this.removeMember = this.handleAsync(this.removeMember.bind(this));
  }
  async getMembers (req, res){
    const currentMembership = await MemberModel.findOne({
      user: req.user._id,
      status: "active",
    });

    if (!currentMembership) {
      this.sendError(res, "You do not belong to any household", 400)
    }

    const members = await MemberModel.find({
      household: currentMembership.household,
      status: "active",
    })
      .populate("user", "fullname email")
      .sort({ joinedAt: -1 });

    return this.sendSuccess(res, members, "Members fetched successfully", 200)
  };
  
  async removeMember (req, res){
    const { memberId } = req.params;
  
    const currentMembership = await MemberModel.findOne({
      user: req.user._id,
      status: "active",
    });

    if (!currentMembership) {
      return this.sendError(res, "You do not belong to any household", 400)
    }

    if (currentMembership.role !== "admin") {
      return this.sendError(res, "Only admin can remove members", 403)
    }

    const memberToRemove = await MemberModel.findById(memberId).populate(
      "user",
      "fullname email"
    );

    if (!memberToRemove) {
      return this.sendError(res, "Member not found", 404)
    }

    if (
      memberToRemove.household.toString() !==
      currentMembership.household.toString()
    ) {
      return this.sendError(res, "You can only remove members from your own household", 403)
    }

    if (memberToRemove.user._id.toString() === req.user._id.toString()) {
      return this.sendError(res, "Admin cannot remove themselves", 400)
    }

    if (memberToRemove.role === "admin") {
      return this.sendError(res, "Admin cannot be removed", 400)
    }

    memberToRemove.status = "removed";
    await memberToRemove.save();

    return this.sendSuccess(res, null, `${memberToRemove.user.fullname} has been removed successfully`, 200)
  };
}



module.exports = new MemberCtrl;