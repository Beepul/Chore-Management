const HouseHoldModel = require("../models/HouseHold.model");

const MembershipModel = require("../models/Member.model");

const setupHouseHold = async (req, res) => {
    const { name, description } = req.body;

    try {
        if (!name || !description) {
            return res.status(400).json({
                message: "Please provide all the fields",
            });
        }

        const userId = req.user._id;

        const existingMembership = await MembershipModel.findOne({
            user: userId,
            status: "active",
        });

        if (existingMembership) {
            return res.status(400).json({
                message: "You already belong to a household",
            });
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

        return res.status(201).json({
            data: {
                household,
                membership,
            },
            message: "Household created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};


module.exports = {setupHouseHold}