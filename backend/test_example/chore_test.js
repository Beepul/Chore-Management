const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const ChoreController = require("../controllers/choreController");

const { expect } = chai;

describe("ChoreController createChore Test", () => {
  let choreService;
  let choreController;
  let req;
  let res;

  beforeEach(() => {
    choreService = {
      createChore: sinon.stub(),
    };

    choreController = new ChoreController(choreService);

    req = {
      user: {
        _id: new mongoose.Types.ObjectId(),
      },
      body: {
        title: "Wash dishes",
        description: "Clean kitchen dishes",
        category: "Cleaning",
        dueDate: "2026-04-20",
        assignedTo: [new mongoose.Types.ObjectId().toString()],
        parentChore: null,
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a chore successfully", async () => {
    const createdChore = {
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      dueDate: req.body.dueDate,
      assignedTo: req.body.assignedTo,
      parentChore: null,
    };

    choreService.createChore.resolves(createdChore);

    await choreController.createChore(req, res);

    expect(choreService.createChore.calledOnceWith(req.user._id, req.body)).to.be
      .true;

    expect(res.status.calledWith(201)).to.be.true;

    expect(
      res.json.calledWithMatch({
        success: true,
        message: "Chore created successfully",
        data: createdChore,
      })
    ).to.be.true;
  });

  it("should return error if service throws an error", async () => {
    choreService.createChore.rejects(new Error("DB Error"));

    await choreController.createChore(req, res);

    expect(res.status.called).to.be.true;
    expect(res.json.called).to.be.true;
  });
});