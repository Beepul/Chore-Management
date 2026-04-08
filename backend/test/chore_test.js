const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const MemberModel = require("../models/Member.model");
const ChoreModel = require("../models/Chore.model");
const { createChore } = require("../controllers/choreController");

const { expect } = chai;

describe("CreateChore Function Test", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should create a new chore successfully", async () => {
    const userId = new mongoose.Types.ObjectId();
    const householdId = new mongoose.Types.ObjectId();

    const req = {
      user: { _id: userId },
      body: {
        title: "Wash dishes",
        description: "Clean kitchen dishes",
        category: "Cleaning",
        dueDate: "2026-04-20",
        assignedTo: [new mongoose.Types.ObjectId().toString()],
        parentChore: null,
      },
    };

    const currentMembership = {
      user: userId,
      household: householdId,
      role: "admin",
      status: "active",
    };

    const createdChore = {
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      dueDate: req.body.dueDate,
      assignedTo: req.body.assignedTo,
      parentChore: null,
      household: householdId,
      createdBy: userId,
    };

    const memberStub = sinon.stub(MemberModel, "findOne").resolves(currentMembership);
    const createStub = sinon.stub(ChoreModel, "create").resolves(createdChore);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createChore(req, res);

    expect(memberStub.calledOnceWith({
      user: req.user._id,
      status: "active",
    })).to.be.true;

    expect(createStub.calledOnce).to.be.true;
    expect(res.status.calledWith(201)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "Chore created successfully",
      })
    ).to.be.true;
  });

  it("should return 400 if title is missing", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        title: "",
        description: "Clean kitchen dishes",
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createChore(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "Title is required",
      })
    ).to.be.true;
  });

  it("should return 400 if user does not belong to any household", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        title: "Wash dishes",
      },
    };

    sinon.stub(MemberModel, "findOne").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createChore(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "You do not belong to any household",
      })
    ).to.be.true;
  });

  it("should return 403 if user is not admin", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        title: "Wash dishes",
      },
    };

    sinon.stub(MemberModel, "findOne").resolves({
      user: req.user._id,
      household: new mongoose.Types.ObjectId(),
      role: "member",
      status: "active",
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createChore(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "Only admin can create chores",
      })
    ).to.be.true;
  });

  it("should return 404 if parent chore is not found", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        title: "Sub chore",
        assignedTo: [new mongoose.Types.ObjectId().toString()],
        parentChore: new mongoose.Types.ObjectId().toString(),
      },
    };

    sinon.stub(MemberModel, "findOne").resolves({
      user: req.user._id,
      household: new mongoose.Types.ObjectId(),
      role: "admin",
      status: "active",
    });

    sinon.stub(ChoreModel, "findById").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createChore(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "Parent chore not found",
      })
    ).to.be.true;
  });

  it("should return 403 if parent chore belongs to another household", async () => {
    const userId = new mongoose.Types.ObjectId();
    const householdId = new mongoose.Types.ObjectId();

    const req = {
      user: { _id: userId },
      body: {
        title: "Sub chore",
        assignedTo: [new mongoose.Types.ObjectId().toString()],
        parentChore: new mongoose.Types.ObjectId().toString(),
      },
    };

    sinon.stub(MemberModel, "findOne").resolves({
      user: userId,
      household: householdId,
      role: "admin",
      status: "active",
    });

    sinon.stub(ChoreModel, "findById").resolves({
      _id: req.body.parentChore,
      household: new mongoose.Types.ObjectId(),
      assignedTo: [],
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createChore(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "Parent chore does not belong to your household",
      })
    ).to.be.true;
  });

  it("should return 400 if sub-chore is assigned to users not in parent chore assignment", async () => {
    const userId = new mongoose.Types.ObjectId();
    const householdId = new mongoose.Types.ObjectId();
    const assignedUserId = new mongoose.Types.ObjectId().toString();
    const parentAssignedUserId = new mongoose.Types.ObjectId().toString();

    const req = {
      user: { _id: userId },
      body: {
        title: "Sub chore",
        assignedTo: [assignedUserId],
        parentChore: new mongoose.Types.ObjectId().toString(),
      },
    };

    sinon.stub(MemberModel, "findOne").resolves({
      user: userId,
      household: householdId,
      role: "admin",
      status: "active",
    });

    sinon.stub(ChoreModel, "findById").resolves({
      _id: req.body.parentChore,
      household: householdId,
      assignedTo: [parentAssignedUserId],
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createChore(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message:
          "Sub-chore can only be assigned to members already assigned to the parent chore",
      })
    ).to.be.true;
  });

  it("should return 500 if an error occurs", async () => {
    const req = {
      user: { _id: new mongoose.Types.ObjectId() },
      body: {
        title: "Wash dishes",
      },
    };

    sinon.stub(MemberModel, "findOne").throws(new Error("DB Error"));

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createChore(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "DB Error",
      })
    ).to.be.true;
  });
});