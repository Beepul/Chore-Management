const BaseController = require(".");
const HouseHoldModel = require("../models/HouseHold.model");

const MembershipModel = require("../models/Member.model");

class HouseholdCtrl extends BaseController {
    async setupHouseHold (req, res) {
        const { name, description } = req.body;
    
        try {
            if (!name || !description) {
                return this.sendError(res, "Please provide all the fields", 400)
            }
    
            const userId = req.user._id;
    
            const existingMembership = await MembershipModel.findOne({
                user: userId,
                status: "active",
            });
    
            if (existingMembership) {
                return this.sendError(res, "You already belong to a household", 400)
            }
    
            const household = await HouseHoldModel.create({
                name,
                description,
                createdBy: userId,
            });
    
            const membership = await MembershipModel.create({
                user: userId,
                household: household._id,
                role: "admin",
                status: "active",
            });
    
            return this.sendSuccess(res,
                {
                    household,
                    membership,
                },
                "Household created successfully", 201
            )
            
        } catch (error) {
            return this.sendError(res, error.message)
        }
    };
}



module.exports = new HouseholdCtrl