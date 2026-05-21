const BaseController = require(".");
const MemberModel = require("../models/Member.model");
const ChoreModel = require("../models/Chore.model");
const ChoreFactory = require("../factories/ChoreFactory");

class ChoreController extends BaseController {
  constructor(){
    super(); 
    this.createChore = this.handleAsync(this.createChore.bind(this));
    this.getMainChores = this.handleAsync(this.getMainChores.bind(this));
    this.getAllChores = this.handleAsync(this.getAllChores.bind(this));
    this.getSingleChore = this.handleAsync(this.getSingleChore.bind(this));
    this.deleteChore = this.handleAsync(this.deleteChore.bind(this));
    this.updateChore = this.handleAsync(this.updateChore.bind(this));
    this.updateChoreStatus = this.handleAsync(this.updateChoreStatus.bind(this));
  }

  validateRequestBody(data, action = ""){
    if(action == "CREATE" || action == "UPDATE"){
      if (!data.title) return "Title is required";
      if (!data.dueDate) return "Due date is required";
      if(!data.category) return "Category is required";
      if(!data.assignedTo) return "Assign task to your household member/s"
      if(data.assignedTo.length <= 0) return "Assign task to atleast one member"
    }
    if(action == "UPDATE_STATUS"){
      if (!data.status) return "Status is required";
      if (!["pending", "in_progress", "completed"].includes(data.status)) return "Invalid status value"
    }
    return null
  }

  async getCurrentMembership(userId) {
    return MemberModel.findOne({ user: userId, status: 'active' });
  }

  async createChore(req, res) {
    const validationError = this.validateRequestBody(req.body, "CREATE");

    if (validationError) {
      return this.sendError(res, validationError, 400);
    }

    const { title, description, category, dueDate, assignedTo, parentChore } = req.body;

    const membership = await this.getCurrentMembership(req.user._id) 

    // if (!membership) {
    //   return this.sendError(res, "You do not belong to any household", 400)
    // }

    // if (membership.role !== "admin") {
    //   return this.sendError(res, "Only admin can create chores", 403)
    // }

    const householdId = membership.household;

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

      const chore = ChoreFactory.createChore(category.toLowerCase(), {
        title,
        description,
        dueDate,
        assignedTo,
        parentChore: parentChore || null,
        household: householdId,
        createdBy: req.user._id,
      });

      await chore.save();

    return this.sendSuccess(res, chore, "Chore created successfully", 201)
  }
  
  async getMainChores(req, res) {
    const membership = await this.getCurrentMembership(req.user._id);

    if (!membership) {
      return this.sendError(res, "You do not belong to any household", 400);
    }

    const chores = await ChoreModel.find({
      household:   membership.household,
      parentChore: null,
    }).sort({ createdAt: -1 });

    return this.sendSuccess(res, chores, "Main chores fetched successfully");
  }
  async getAllChores(req, res) {
    const membership = await this.getCurrentMembership(req.user._id);

    if (!membership) {
      return this.sendError(res, "You do not belong to any household", 400);
    }

    const chores = await ChoreModel.find({ household: membership.household })
      .populate("assignedTo", "fullname email")
      .populate("createdBy",  "fullname email")
      .populate("parentChore", "title")
      .sort({ createdAt: -1 });

    return this.sendSuccess(res, chores, "Chores fetched successfully");
  }
  async getSingleChore(req, res) {
    const { id } = req.params;
    const membership = await this.getCurrentMembership(req.user._id);

    if (!membership) {
      return this.sendError(res, "You do not belong to any household", 400);
    }

    const chore = await ChoreModel.findOne({
      _id:       id,
      household: membership.household,
    })
      .populate("assignedTo", "fullname email")
      .populate("createdBy",  "fullname email");

    if (!chore) {
      return this.sendError(res, "Chore not found", 404);
    }

    const subChores = await ChoreModel.find({
      parentChore: chore._id,
      household:   membership.household,
    })
      .populate("assignedTo", "fullname email")
      .populate("createdBy",  "fullname email")
      .sort({ createdAt: 1 });

    return this.sendSuccess(res, { chore, subChores }, "Chore details fetched successfully");
  }
  async deleteChore(req, res) {
    const { id } = req.params;
    const membership = await this.getCurrentMembership(req.user._id);

    const chore = await ChoreModel.findById(id);

    if (!chore) {
      return this.sendError(res, "Chore not found", 404);
    }

    if (chore.household.toString() !== membership.household.toString()) {
      return this.sendError(res, "You can only delete chores from your own household", 403);
    }

    const childChoreExists = await ChoreModel.exists({
      parentChore: id,
    });

    if (childChoreExists) {
      return this.sendError(
        res,
        "Cannot delete this parent chore. Please delete all child chores first.",
        400
      );
    }

    await ChoreModel.findByIdAndDelete(id);

    return this.sendSuccess(res, null, "Chore deleted successfully");
  }
  async updateChore(req, res) {
    const { id } = req.params;

    const validationError = this.validateRequestBody(req.body, "UPDATE");

    if (validationError) {
      return this.sendError(res, validationError, 400);
    }

    const { title, description, category, dueDate, assignedTo } = req.body;

    const membership = await this.getCurrentMembership(req.user._id);

    if (!membership) {
      return this.sendError(res, "You do not belong to any household", 400);
    }

    if (membership.role !== "admin") {
      return this.sendError(res, "Only admin can update chores", 403);
    }

    const chore = await ChoreModel.findById(id);

    if (!chore) {
      return this.sendError(res, "Chore not found", 404);
    }

    if (chore.household.toString() !== membership.household.toString()) {
      return this.sendError(res, "You can only update chores from your own household", 403);
    }

    chore.title       = title;
    chore.description = description || "";
    chore.category    = category    || "";
    chore.dueDate     = dueDate     || null;
    chore.assignedTo  = assignedTo  || [];
    await chore.save();

    return this.sendSuccess(res, chore, "Chore updated successfully");
  }

  async updateChoreStatus(req, res) {
    const { id } = req.params;

    const validationError = this.validateRequestBody(req.body, "UPDATE_STATUS");

    if (validationError) {
      return this.sendError(res, validationError, 400);
    }

    const { status } = req.body;

    const membership = await this.getCurrentMembership(req.user._id);

    if (!membership) {
      return this.sendError(res, "You do not belong to any household", 400);
    }

    const chore = await ChoreModel.findById(id);

    if (!chore) {
      return this.sendError(res, "Chore not found", 404);
    }

    if (chore.household.toString() !== membership.household.toString()) {
      return this.sendError(res, "You can only update chores from your own household", 403);
    }

    const isAssigned = chore.assignedTo.some(
      (memberId) => memberId.toString() === req.user._id.toString()
    );

    if (!isAssigned) {
      return this.sendError(res, "You can only update chores assigned to you", 403);
    }

    if (status === "completed") {
      const incompleteChildChore = await ChoreModel.findOne({
        parentChore: chore._id,
        status: { $ne: "completed" },
      });

      if (incompleteChildChore) {
        return this.sendError(
          res,
          "Cannot mark this chore as completed until all child chores are completed.",
          400
        );
      }
    }

    chore.status = status;
    await chore.save();

    return this.sendSuccess(res, chore, "Chore status updated successfully");
  }
}

module.exports = new ChoreController();