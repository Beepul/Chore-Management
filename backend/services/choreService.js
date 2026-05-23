// const this.choreRepository = require("../repositories/this.choreRepository");

class ChoreService {
  constructor(choreRepository) {
    this.choreRepository = this.choreRepository;
  }

  async getAllChores(userId) {
    const membership = await this.choreRepository.findActiveMembership(userId);

    if (!membership) {
      throw new Error("You do not belong to any household");
    }

    return await this.choreRepository.findAllByHousehold(membership.household);
  }

  async getMainChores(userId) {
    const membership = await this.choreRepository.findActiveMembership(userId);

    if (!membership) {
      throw new Error("You do not belong to any household");
    }

    return await this.choreRepository.findMainChoresByHousehold(membership.household);
  }

  async getSingleChore(userId, choreId) {
    const membership = await this.choreRepository.findActiveMembership(userId);

    if (!membership) {
      throw new Error("You do not belong to any household");
    }

    const chore = await this.choreRepository.findOneByIdAndHousehold(
      choreId,
      membership.household
    );

    if (!chore) {
      throw new Error("Chore not found");
    }

    const subChores = await this.choreRepository.findSubChores(
      chore._id,
      membership.household
    );

    return { chore, subChores };
  }
  validateChoreData(data, action = "") {
  if (action === "CREATE" || action === "UPDATE") {
    if (!data.title) return "Title is required";
    if (!data.dueDate) return "Due date is required";
    if (!data.category) return "Category is required";
    if (!data.assignedTo) return "Assign task to your household member/s";
    if (data.assignedTo.length <= 0) return "Assign task to atleast one member";
  }

  if (action === "UPDATE_STATUS") {
    if (!data.status) return "Status is required";
    if (!["pending", "in_progress", "completed"].includes(data.status)) {
      return "Invalid status value";
    }
  }

  return null;
}
async createChore(userId, data) {
  const validationError = this.validateChoreData(data, "CREATE");

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const membership = await this.choreRepository.findActiveMembership(userId);

  if (!membership) {
    const error = new Error("You do not belong to any household");
    error.statusCode = 400;
    throw error;
  }

  const {
    title,
    description,
    category,
    dueDate,
    assignedTo,
    parentChore,
  } = data;

  const householdId = membership.household;

  if (parentChore) {
    const parent = await this.choreRepository.findById(parentChore);

    if (!parent) {
      const error = new Error("Parent chore not found");
      error.statusCode = 404;
      throw error;
    }

    if (parent.household.toString() !== householdId.toString()) {
      const error = new Error("Parent chore does not belong to your household");
      error.statusCode = 403;
      throw error;
    }

    const isValidAssignment = (assignedTo || []).every((userId) =>
      parent.assignedTo.some(
        (parentUserId) => parentUserId.toString() === userId
      )
    );

    if (!isValidAssignment) {
      const error = new Error(
        "Sub-chore can only be assigned to members already assigned to the parent chore"
      );
      error.statusCode = 400;
      throw error;
    }
  }

  return await this.choreRepository.create({
    title,
    description,
    category,
    dueDate: dueDate || null,
    assignedTo: assignedTo || [],
    parentChore: parentChore || null,
    household: householdId,
    createdBy: userId,
  });
}
async updateChore(userId, choreId, data) {
  const validationError = this.validateChoreData(data, "UPDATE");

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const membership = await this.choreRepository.findActiveMembership(userId);

  if (!membership) {
    const error = new Error("You do not belong to any household");
    error.statusCode = 400;
    throw error;
  }

  if (membership.role !== "admin") {
    const error = new Error("Only admin can update chores");
    error.statusCode = 403;
    throw error;
  }

  const chore = await this.choreRepository.findById(choreId);

  if (!chore) {
    const error = new Error("Chore not found");
    error.statusCode = 404;
    throw error;
  }

  if (chore.household.toString() !== membership.household.toString()) {
    const error = new Error("You can only update chores from your own household");
    error.statusCode = 403;
    throw error;
  }

  chore.title = data.title;
  chore.description = data.description || "";
  chore.category = data.category || "";
  chore.dueDate = data.dueDate || null;
  chore.assignedTo = data.assignedTo || [];

  return await this.choreRepository.save(chore);
}
async deleteChore(userId, choreId) {
  const membership = await this.choreRepository.findActiveMembership(userId);

  if (!membership) {
    const error = new Error("You do not belong to any household");
    error.statusCode = 400;
    throw error;
  }

  const chore = await this.choreRepository.findById(choreId);

  if (!chore) {
    const error = new Error("Chore not found");
    error.statusCode = 404;
    throw error;
  }

  if (chore.household.toString() !== membership.household.toString()) {
    const error = new Error("You can only delete chores from your own household");
    error.statusCode = 403;
    throw error;
  }

  const childChoreExists = await this.choreRepository.childChoreExists(choreId);

  if (childChoreExists) {
    const error = new Error(
      "Cannot delete this parent chore. Please delete all child chores first."
    );
    error.statusCode = 400;
    throw error;
  }

  await this.choreRepository.deleteById(choreId);

  return null;
}
async updateChoreStatus(userId, choreId, data) {
  const validationError = this.validateChoreData(data, "UPDATE_STATUS");

  if (validationError) {
    const error = new Error(validationError);
    error.statusCode = 400;
    throw error;
  }

  const membership = await this.choreRepository.findActiveMembership(userId);

  if (!membership) {
    const error = new Error("You do not belong to any household");
    error.statusCode = 400;
    throw error;
  }

  const chore = await this.choreRepository.findById(choreId);

  if (!chore) {
    const error = new Error("Chore not found");
    error.statusCode = 404;
    throw error;
  }

  if (chore.household.toString() !== membership.household.toString()) {
    const error = new Error("You can only update chores from your own household");
    error.statusCode = 403;
    throw error;
  }

  const isAssigned = chore.assignedTo.some(
    (memberId) => memberId.toString() === userId.toString()
  );

  if (!isAssigned) {
    const error = new Error("You can only update chores assigned to you");
    error.statusCode = 403;
    throw error;
  }

  if (data.status === "completed") {
    const incompleteChildChore =
      await this.choreRepository.findIncompleteChildChore(chore._id);

    if (incompleteChildChore) {
      const error = new Error(
        "Cannot mark this chore as completed until all child chores are completed."
      );
      error.statusCode = 400;
      throw error;
    }
  }

  chore.status = data.status;

  return await this.choreRepository.save(chore);
}
}

module.exports = ChoreService;