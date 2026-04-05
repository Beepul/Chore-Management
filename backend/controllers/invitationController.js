const jwt = require('jsonwebtoken');
const UserModel = require('../models/User.model');
const InvitationModel = require("../models/Invitation.model");
const MemberModel = require('../models/Member.model');


const inviteMember = async (req, res) => {
    const {email} = req.body;

    try{
        if (!email) {
            return res.status(400).json({
                message: "Please provide email",
            });
        }
        const userId = req.user._id;

        const currentMembership = await MemberModel.findOne({
            user: userId,
            status: "active",
        });

        if (!currentMembership) {
            return res.status(400).json({
                message: "You do not belong to any household",
            });
        }
        if (currentMembership.role !== "admin") {
            return res.status(403).json({
                message: "Only household admin can invite members",
            });
        }
        const householdId = currentMembership.household;
        
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            const existingMembership = await MemberModel.findOne({
                user: existingUser._id,
                status: "active",
            });

            if (existingMembership) {
                return res.status(400).json({
                message: "This user already belongs to a household",
                });
            }
        }
        const existingInvitation = await InvitationModel.findOne({
            email: email.toLowerCase(),
            household: householdId,
            status: "pending",
            expiresAt: { $gt: new Date() },
        });

        if (existingInvitation) {
            return res.status(400).json({
                message: "An active invitation already exists for this email",
            });
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
        return res.status(201).json({
            data: {
                invitation,
                joinLink: `http://localhost:3000/join-household/${token}`,
            },
            message: "Invitation created successfully",
        });
    }catch(error){
        return res.status(500).json({
            message: error.message,
        });
    }
}

const getMyInvitations = async (req, res) => {
  try {
    const invitations = await InvitationModel.find({
      email: req.user.email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("household", "name description")
      .populate("invitedBy", "fullname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      data: invitations,
      message: "Invitations fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const acceptInvitation = async (req, res) => {
  const { invitationId } = req.params;

  try {
    const userId = req.user._id;
    const userEmail = req.user.email?.toLowerCase();

    const existingMembership = await MemberModel.findOne({
      user: userId,
      status: "active",
    });

    if (existingMembership) {
      return res.status(400).json({
        message: "You already belong to a household",
      });
    }

    const invitation = await InvitationModel.findById(invitationId);

    if (!invitation) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (invitation.status !== "pending") {
      return res.status(400).json({
        message: "This invitation is no longer available",
      });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();

      return res.status(400).json({
        message: "This invitation has expired",
      });
    }

    if (invitation.email !== userEmail) {
      return res.status(403).json({
        message: "You are not allowed to accept this invitation",
      });
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

    return res.status(201).json({
      data: membership,
      message: "Invitation accepted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = { inviteMember, getMyInvitations, acceptInvitation };