const ChoreModel = require("../models/Chore.model");
const MemberModel = require("../models/Member.model");

class ChoreRepository {
  async findActiveMembership(userId) {
    return MemberModel.findOne({
      user: userId,
      status: "active",
    });
  }

  async create(data) {
    return ChoreModel.create(data);
  }

  async findById(id) {
    return ChoreModel.findById(id);
  }

  async findMainChoresByHousehold(householdId) {
    return ChoreModel.find({
      household: householdId,
      parentChore: null,
    }).sort({ createdAt: -1 });
  }

  async findAllByHousehold(householdId) {
    return ChoreModel.find({ household: householdId })
      .populate("assignedTo", "fullname email")
      .populate("createdBy", "fullname email")
      .populate("parentChore", "title")
      .sort({ createdAt: -1 });
  }

  async findOneByIdAndHousehold(id, householdId) {
    return ChoreModel.findOne({
      _id: id,
      household: householdId,
    })
      .populate("assignedTo", "fullname email")
      .populate("createdBy", "fullname email");
  }

  async findSubChores(parentChoreId, householdId) {
    return ChoreModel.find({
      parentChore: parentChoreId,
      household: householdId,
    })
      .populate("assignedTo", "fullname email")
      .populate("createdBy", "fullname email")
      .sort({ createdAt: 1 });
  }

  async childChoreExists(parentChoreId) {
    return ChoreModel.exists({
      parentChore: parentChoreId,
    });
  }

  async findIncompleteChildChore(parentChoreId) {
    return ChoreModel.findOne({
      parentChore: parentChoreId,
      status: { $ne: "completed" },
    });
  }

  async deleteById(id) {
    return ChoreModel.findByIdAndDelete(id);
  }

  async save(chore) {
    return chore.save();
  }
}

module.exports = new ChoreRepository();