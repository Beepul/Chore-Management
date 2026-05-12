const BaseController = require(".");
const HouseHoldModel = require("../models/HouseHold.model");
const MemberModel = require("../models/Member.model");
const UserModel = require("../models/User.model");
const bcrypt = require('bcrypt');

class SettingsCtrl extends BaseController {
  constructor(){
    super()
    this.updateProfile = this.updateProfile.bind(this);
    this.updateHouseholdName = this.updateHouseholdName.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }
  async updateProfile (req, res) {
    const { fullname } = req.body;
  
    try {
      if (!fullname) {
        return this.sendError(res, "Full name is required", 400)
      }
  
      const user = await UserModel.findById(req.user._id);
  
      if (!user) {
        return this.sendError(res, "User not found", 404)
      }
  
      user.fullname = fullname;
      await user.save();
  
      return this.sendSuccess(res, 
        {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
        },
        "Profile updated successfully", 200
      )

    } catch (error) {
      return this.sendError(res, error.message)
    }
  };
  
  
  async updateHouseholdName (req, res) {
    const { name } = req.body;
  
    try {
      if (!name) {
        return this.sendError(res, "Household name is required", 400)
       
      }
  
      const currentMembership = await MemberModel.findOne({
        user: req.user._id,
        status: "active",
      });
  
      if (!currentMembership) {
        return this.sendError(res, "You do not belong to any household", 400)
      }
  
      if (currentMembership.role !== "admin") {
        return this.sendError(res, "Only admin can update household name", 403)
      }
  
      const household = await HouseHoldModel.findById(currentMembership.household);
  
      if (!household) {
        return this.sendError(res, "Household not found", 404)
      }
  
      household.name = name;
      await household.save();
  
      return this.sendSuccess(res, household,  "Household name updated successfully", 200)
      
    } catch (error) {
      return this.sendError(res, error.message)
    }
  };
  
  async changePassword (req, res) {
    const { currentPassword, newPassword, confirmPassword } = req.body;
  
    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        return this.sendError(res, "Please provide all password fields", 400)
      }
  
      if (newPassword !== confirmPassword) {
        return this.sendError(res, "New password and confirm password do not match", 400)
      }
  
      const user = await UserModel.findById(req.user._id);
  
      if (!user) {
        return this.sendError(res, "User not found", 404)
      }
  
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
  
      if (!isValidPassword) {
        return this.sendError(res, "Current password is incorrect", 400)
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      user.password = hashedPassword;
      await user.save();
  
      return this.sendSuccess(res, null, "Password changed successfully", 200)
      
    } catch (error) {
      return this.sendError(res, error.message)
    }
  };

}


module.exports = new SettingsCtrl;