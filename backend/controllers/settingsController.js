const HouseHoldModel = require("../models/HouseHold.model");
const MemberModel = require("../models/Member.model");
const UserModel = require("../models/User.model");

const updateProfile = async (req, res) => {
  const { fullname } = req.body;

  try {
    if (!fullname) {
      return res.status(400).json({
        message: "Full name is required",
      });
    }

    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.fullname = fullname;
    await user.save();

    return res.status(200).json({
      data: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


const updateHouseholdName = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({
        message: "Household name is required",
      });
    }

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
        message: "Only admin can update household name",
      });
    }

    const household = await HouseHoldModel.findById(currentMembership.household);

    if (!household) {
      return res.status(404).json({
        message: "Household not found",
      });
    }

    household.name = name;
    await household.save();

    return res.status(200).json({
      data: household,
      message: "Household name updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { updateProfile, updateHouseholdName };