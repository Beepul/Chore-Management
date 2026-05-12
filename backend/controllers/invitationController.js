const jwt = require('jsonwebtoken');
const UserModel = require('../models/User.model');
const InvitationModel = require("../models/Invitation.model");
const MemberModel = require('../models/Member.model');
const BaseController = require('.');


class InvitationCtrl extends BaseController{
  constructor(){
    super()
    this.acceptInvitation = this.acceptInvitation.bind(this);
    this.getMyInvitations = this.getMyInvitations.bind(this);
    this.inviteMember = this.inviteMember.bind(this);
  }
  async inviteMember (req, res) {
      const {email} = req.body;
  
      try{
          if (!email) {
            return this.sendError(res, "Please provide email", 400)
          }
          const userId = req.user._id;
  
          const currentMembership = await MemberModel.findOne({
              user: userId,
              status: "active",
          });
  
          if (!currentMembership) {
            return this.sendError(res, "You do not belong to any household", 400)
          }
          if (currentMembership.role !== "admin") {
            return this.sendError(res, "Only household admin can invite members", 403)
          }
          const householdId = currentMembership.household;
          
          const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  
          if (existingUser) {
              const existingMembership = await MemberModel.findOne({
                  user: existingUser._id,
                  status: "active",
              });
  
              if (existingMembership) {
                return this.sendError(res, "This user already belongs to a household", 400)
              }
          }
          const existingInvitation = await InvitationModel.findOne({
              email: email.toLowerCase(),
              household: householdId,
              status: "pending",
              expiresAt: { $gt: new Date() },
          });
  
          if (existingInvitation) {
            return this.sendError(res, "An active invitation already exists for this email", 400)
          }
  
          const token = jwt.sign(
              {
                  email: email.toLowerCase(),
                  householdId: householdId.toString(),
                  invitedBy: userId.toString(),
              },
              process.env.JWT_SECRET,
              { expiresIn: "3d" }
          );
          const invitation = await InvitationModel.create({
              household: householdId,
              email: email.toLowerCase(),
              invitedBy: userId,
              token,
              expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          });
          return this.sendSuccess(res, 
            {
              invitation,
              joinLink: `http://localhost:3000/join-household/${token}`,
            },
            "Invitation created successfully", 201
          )
      }catch(error){
        return this.sendError(res, error.message)
      }
  }
  
  async getMyInvitations (req, res) {
    try {
      const invitations = await InvitationModel.find({
        email: req.user.email,
        status: "pending",
        expiresAt: { $gt: new Date() },
      })
        .populate("household", "name description")
        .populate("invitedBy", "fullname email")
        .sort({ createdAt: -1 });
  
      return this.sendSuccess(res, invitations, "Invitations fetched successfully", 200)

    } catch (error) {
      return this.sendError(res, error.message)
    }
  };
  
  async acceptInvitation (req, res) {
    const { invitationId } = req.params;
  
    try {
      const userId = req.user._id;
      const userEmail = req.user.email?.toLowerCase();
  
      const existingMembership = await MemberModel.findOne({
        user: userId,
        status: "active",
      });
  
      if (existingMembership) {
        return this.sendError(res, "You already belong to a household", 400)
      }
  
      const invitation = await InvitationModel.findById(invitationId);
  
      if (!invitation) {
        return this.sendError(res,  "Invitation not found", 404)
      }
  
      if (invitation.status !== "pending") {
        return this.sendError(res,  "This invitation is no longer available", 400)
      }
  
      if (invitation.expiresAt < new Date()) {
        invitation.status = "expired";
        await invitation.save();
  
        return this.sendError(res, "This invitation has expired", 400)
      }
  
      if (invitation.email !== userEmail) {
        return this.sendError(res, "You are not allowed to accept this invitation", 403)
      }
  
      const membership = await MemberModel.create({
        user: userId,
        household: invitation.household,
        role: "user",
        status: "active",
      });
  
      invitation.status = "accepted";
      await invitation.save();
  
      await InvitationModel.updateMany(
        {
          email: userEmail,
          status: "pending",
          _id: { $ne: invitation._id },
        },
        {
          status: "expired",
        }
      );
  
      return this.sendSuccess(res, membership, "Invitation accepted successfully", 201)
      
    } catch (error) {
      return this.sendError(res, error.message)
    }
  };
}



module.exports = new InvitationCtrl;