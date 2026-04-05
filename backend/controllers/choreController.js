const MemberModel = require("../models/Member.model");
const ChoreModel = require("../models/Chore.model");

const createChore = async (req, res) => {
  const { title, description, category, dueDate, assignedTo, parentChore } = req.body;

  try {
    if (!title) {
      return res.status(400).json({
        message: "Title is required",
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
        message: "Only admin can create chores",
      });
    }

    const householdId = currentMembership.household;

    if (parentChore) {
      const parent = await ChoreModel.findById(parentChore);

      if (!parent) {
        return res.status(404).json({
          message: "Parent chore not found",
        });
      }

      if (parent.household.toString() !== householdId.toString()) {
        return res.status(403).json({
          message: "Parent chore does not belong to your household",
        });
      }

      const isValidAssignment = (assignedTo || []).every((userId) =>
        parent.assignedTo.some(
          (parentUserId) => parentUserId.toString() === userId
        )
      );

      if (!isValidAssignment) {
        return res.status(400).json({
          message:
            "Sub-chore can only be assigned to members already assigned to the parent chore",
        });
      }
    }

    const chore = await ChoreModel.create({
      title,
      description,
      category,
      dueDate: dueDate || null,
      assignedTo: assignedTo || [],
      parentChore: parentChore || null,
      household: householdId,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      data: chore,
      message: "Chore created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

const getMainChores = async (req, res) => {
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

    const chores = await ChoreModel.find({
      household: currentMembership.household,
      parentChore: null,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      data: chores,
      message: "Main chores fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = { createChore, getMainChores };