const MemberModel = require("../models/Member.model");

const getMembers = async (req, res) => {
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

    const members = await MemberModel.find({
      household: currentMembership.household,
      status: "active",
    })
      .populate("user", "fullname email")
      .sort({ joinedAt: -1 });

    return res.status(200).json({
      data: members,
      message: "Members fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const removeMember = async (req, res) => {
  const { memberId } = req.params;

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
        message: "Only admin can remove members",
      });
    }

    const memberToRemove = await MemberModel.findById(memberId).populate(
      "user",
      "fullname email"
    );

    if (!memberToRemove) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (
      memberToRemove.household.toString() !==
      currentMembership.household.toString()
    ) {
      return res.status(403).json({
        message: "You can only remove members from your own household",
      });
    }

    if (memberToRemove.user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "Admin cannot remove themselves",
      });
    }

    if (memberToRemove.role === "admin") {
      return res.status(400).json({
        message: "Admin cannot be removed",
      });
    }

    memberToRemove.status = "removed";
    await memberToRemove.save();

    return res.status(200).json({
      message: `${memberToRemove.user.fullname} has been removed successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = { getMembers,  removeMember};