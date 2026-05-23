const BaseController = require(".");
// const this.choreService = require("../services/this.choreService");

class ChoreController extends BaseController {
  constructor(choreService) {
    super();
    this.choreService = choreService;
    this.createChore = this.handleAsync(this.createChore.bind(this));
    this.getMainChores = this.handleAsync(this.getMainChores.bind(this));
    this.getAllChores = this.handleAsync(this.getAllChores.bind(this));
    this.getSingleChore = this.handleAsync(this.getSingleChore.bind(this));
    this.deleteChore = this.handleAsync(this.deleteChore.bind(this));
    this.updateChore = this.handleAsync(this.updateChore.bind(this));
    this.updateChoreStatus = this.handleAsync(this.updateChoreStatus.bind(this));
  }

  async createChore(req, res) {
    const chore = await this.choreService.createChore(req.user._id, req.body);
    return this.sendSuccess(res, chore, "Chore created successfully", 201);
  }

  async getMainChores(req, res) {
    const chores = await this.choreService.getMainChores(req.user._id);
    return this.sendSuccess(res, chores, "Main chores fetched successfully");
  }

  async getAllChores(req, res) {
    const chores = await this.choreService.getAllChores(req.user._id);
    return this.sendSuccess(res, chores, "Chores fetched successfully");
  }

  async getSingleChore(req, res) {
    const { id } = req.params;
    const data = await this.choreService.getSingleChore(req.user._id, id);
    return this.sendSuccess(res, data, "Chore details fetched successfully");
  }

  async deleteChore(req, res) {
    const { id } = req.params;
    await this.choreService.deleteChore(req.user._id, id);
    return this.sendSuccess(res, null, "Chore deleted successfully");
  }

  async updateChore(req, res) {
    const { id } = req.params;
    const chore = await this.choreService.updateChore(req.user._id, id, req.body);
    return this.sendSuccess(res, chore, "Chore updated successfully");
  }

  async updateChoreStatus(req, res) {
    const { id } = req.params;

    const chore = await this.choreService.updateChoreStatus(
      req.user._id,
      id,
      req.body
    );

    return this.sendSuccess(res, chore, "Chore status updated successfully");
  }
}

module.exports = ChoreController;