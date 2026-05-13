
const HouseHoldModel = require("../models/HouseHold.model");
const Membership = require("../models/Member.model");

class AuthorizeRoles {
  allow(...allowedRoles) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: "User not authenticated.",
          });
        }

        const household = await HouseHoldModel.findOne({
          createdBy: req.user._id
        })

        if(!household){
          return res.status(403).json({
            success: false,
            message: "Please make sure you have your own household."
          })
        }

        const membership = await Membership.findOne({
          user: req.user._id,
          status: "active",
        });

        if (!membership) {
          return res.status(403).json({
            success: false,
            message: "Active household membership not found.",
          });
        }

        if (!allowedRoles.includes(membership.role)) {
          return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action.",
          });
        }

        req.member = membership;

        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message || "Authorization failed.",
        });
      }
    };
  }
}

module.exports = new AuthorizeRoles();