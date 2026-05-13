const BaseController = require(".");
const HouseHoldModel = require("../models/HouseHold.model");

const MembershipModel = require("../models/Member.model");

class HouseholdCtrl extends BaseController {
    constructor(){
        super()
        this.setupHouseHold = this.handleAsync(this.setupHouseHold.bind(this));
    }
    validateRequestBody(data, action=""){
        if(action == "SETUP"){
            if (!data.name || !data.description) {
                return "Please provide all the fields"
            }
        }
        return null
    }
    async setupHouseHold (req, res) {

        const validationError = this.validateRequestBody(req.body, "SETUP");

        if (validationError) {
            return this.sendError(res, validationError, 400);
        }

        const { name, description } = req.body;

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
    };
}



module.exports = new HouseholdCtrl