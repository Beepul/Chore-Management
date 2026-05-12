const BaseController = require(".");
const MemberModel = require("../models/Member.model");
const ChoreModel = require("../models/Chore.model");

class ChoreController extends BaseController {
  constructor(){
    super(); // required when extending a class
    // Manually bind every method to this instance
    this.createChore = this.createChore.bind(this);
    this.getMainChores = this.getMainChores.bind(this);
    this.getAllChores = this.getAllChores.bind(this);
    this.getSingleChore = this.getSingleChore.bind(this);
    this.deleteChore = this.deleteChore.bind(this);
    this.updateChore = this.updateChore.bind(this);
    this.updateChoreStatus = this.updateChoreStatus.bind(this);
  }

  async getCurrentMembership(userId) {
    return MemberModel.findOne({ user: userId, status: 'active' });
  }

  async createChore(req, res) {
    try {
      const { title, description, category, dueDate, assignedTo, parentChore } = req.body;

      if (!title) {
        return this.sendError(res, "Title is required", 400)
      }

      const currentMembership = await this.getCurrentMembership(req.user._id) 

      if (!currentMembership) {
        return this.sendError(res, "You do not belong to any household", 400)
      }

      if (currentMembership.role !== "admin") {
        return this.sendError(res, "Only admin can create chores", 403)
      }

      const householdId = currentMembership.household;

      if (parentChore) {
        const parent = await ChoreModel.findById(parentChore);

        if (!parent) {
          return this.sendError(res, "Parent chore not found", 404)
        }

        if (parent.household.toString() !== householdId.toString()) {
          return this.sendError(res, "Parent chore does not belong to your household", 403)
        }

        const isValidAssignment = (assignedTo || []).every((userId) =>
          parent.assignedTo.some((parentUserId) => parentUserId.toString() === userId)
        );

        if (!isValidAssignment) {
          return this.sendError(res,"Sub-chore can only be assigned to members already assigned to the parent chore", 400)
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

      return this.sendSuccess(res, chore, "Chore created successfully", 201)
    } catch (error) {
      return this.sendError(res, error.message)
    }
  }
  async getMainChores(req, res) {
    try {
      const currentMembership = await this.getCurrentMembership(req.user._id);

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
  }
  async getAllChores(req, res){
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
      })
        .populate("assignedTo", "fullname email")
        .populate("createdBy", "fullname email")
        .populate("parentChore", "title")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        data: chores,
        message: "Chores fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
  async getSingleChore(req, res){
    const { id } = req.params;
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

      const chore = await ChoreModel.findOne({
        _id: id,
        household: currentMembership.household,
      })
        .populate("assignedTo", "fullname email")
        .populate("createdBy", "fullname email");

      if (!chore) {
        return res.status(404).json({
          message: "Chore not found",
        });
      }

      const subChores = await ChoreModel.find({
        parentChore: chore._id,
        household: currentMembership.household,
      })
        .populate("assignedTo", "fullname email")
        .populate("createdBy", "fullname email")
        .sort({ createdAt: 1 });

      return res.status(200).json({
        data: {
          chore,
          subChores,
        },
        message: "Chore details fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
  async deleteChore(req, res){
    const { id } = req.params;
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
          message: "Only admin can delete chores",
        });
      }

      const chore = await ChoreModel.findById(id);

      if (!chore) {
        return res.status(404).json({
          message: "Chore not found",
        });
      }

      if (chore.household.toString() !== currentMembership.household.toString()) {
        return res.status(403).json({
          message: "You can only delete chores from your own household",
        });
      }

      await ChoreModel.findByIdAndDelete(id);

      return res.status(200).json({
        message: "Chore deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
  async updateChore(req, res){
    const { id } = req.params;
    const { title, description, category, dueDate, assignedTo } = req.body;

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
          message: "Only admin can update chores",
        });
      }

      const chore = await ChoreModel.findById(id);

      if (!chore) {
        return res.status(404).json({
          message: "Chore not found",
        });
      }

      if (chore.household.toString() !== currentMembership.household.toString()) {
        return res.status(403).json({
          message: "You can only update chores from your own household",
        });
      }

      chore.title = title;
      chore.description = description || "";
      chore.category = category || "";
      chore.dueDate = dueDate || null;
      chore.assignedTo = assignedTo || [];

      await chore.save();

      return res.status(200).json({
        data: chore,
        message: "Chore updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
  async updateChoreStatus(req, res){
    const { id } = req.params;
    const { status } = req.body;

    try {
      if (!status) {
        return res.status(400).json({
          message: "Status is required",
        });
      }

      const allowedStatuses = ["pending", "in_progress", "completed"];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status value",
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

      const chore = await ChoreModel.findById(id);

      if (!chore) {
        return res.status(404).json({
          message: "Chore not found",
        });
      }

      if (chore.household.toString() !== currentMembership.household.toString()) {
        return res.status(403).json({
          message: "You can only update chores from your own household",
        });
      }

      const isAssigned = chore.assignedTo.some(
        (memberId) => memberId.toString() === req.user._id.toString()
      );

      if (!isAssigned) {
        return res.status(403).json({
          message: "You can only update chores assigned to you",
        });
      }

      chore.status = status;
      await chore.save();

      return res.status(200).json({
        data: chore,
        message: "Chore status updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}

module.exports = new ChoreController();