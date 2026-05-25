const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const UserModel = require("../models/User.model");
const { registerUser } = require("../controllers/authController");

const { expect } = chai;

describe("User Register Function Test", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should register a user successfully", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "john@example.com",
        password: "123456",
        confirmPassword: "123456"
      }
    };

    const createdUser = {
      _id: new mongoose.Types.ObjectId(),
      fullname: req.body.fullname,
      email: req.body.email
    };

    sinon.stub(UserModel, "findOne").resolves(null);
    sinon.stub(UserModel, "create").resolves(createdUser);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await registerUser(req, res);

    expect(res.status.called).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it("should return 400 if email already exists", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "john@example.com",
        password: "123456",
        confirmPassword: "123456"
      }
    };

    sinon.stub(UserModel, "findOne").resolves({ email: req.body.email });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await registerUser(req, res);

    expect(res.status.called).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it("should return error if passwords do not match", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "john@example.com",
        password: "123456",
        confirmPassword: "654321"
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await registerUser(req, res);

    expect(res.status.called).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it("should return 500 if an error occurs", async () => {
    const req = {
      body: {
        fullname: "John Doe",
        email: "john@example.com",
        password: "123456",
        confirmPassword: "123456"
      }
    };

    sinon.stub(UserModel, "findOne").throws(new Error("DB Error"));

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy()
    };

    await registerUser(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});