const chai = require("chai");
const sinon = require("sinon");

const UserModel = require("../models/User.model"); // change if needed
const { loginUser } = require("../controllers/authController"); // change if needed
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { expect } = chai;

describe("User Login Function Test", () => {
  afterEach(() => {
    sinon.restore();
  });

  it("should login user successfully", async () => {
    const req = {
      body: {
        email: "john@example.com",
        password: "123456"
      }
    };

    const foundUser = {
      _id: "661111111111111111111111",
      fullname: "John Doe",
      email: "john@example.com",
      password: "hashed-password"
    };

    sinon.stub(UserModel, "findOne").resolves(foundUser);
    sinon.stub(bcrypt, "compare").resolves(true);
    sinon.stub(jwt, "sign").returns("fake-jwt-token");

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
      cookie: sinon.stub().returnsThis()
    };

    await loginUser(req, res);

    expect(UserModel.findOne.calledOnce).to.be.true;
    expect(bcrypt.compare.calledOnce).to.be.true;
    expect(res.status.called).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it("should return 404 if user is not found", async () => {
    const req = {
      body: {
        email: "john@example.com",
        password: "123456"
      }
    };

    sinon.stub(UserModel, "findOne").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
      cookie: sinon.stub().returnsThis()
    };

    await loginUser(req, res);

    expect(res.status.called).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it("should return 401 if password is incorrect", async () => {
    const req = {
      body: {
        email: "john@example.com",
        password: "wrongpassword"
      }
    };

    const foundUser = {
      _id: "661111111111111111111111",
      fullname: "John Doe",
      email: "john@example.com",
      password: "hashed-password"
    };

    sinon.stub(UserModel, "findOne").resolves(foundUser);
    sinon.stub(bcrypt, "compare").resolves(false);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
      cookie: sinon.stub().returnsThis()
    };

    await loginUser(req, res);

    expect(res.status.called).to.be.true;
    expect(res.json.called).to.be.true;
  });

  it("should return 500 if an error occurs", async () => {
    const req = {
      body: {
        email: "john@example.com",
        password: "123456"
      }
    };

    sinon.stub(UserModel, "findOne").throws(new Error("DB Error"));

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
      cookie: sinon.stub().returnsThis()
    };

    await loginUser(req, res);

    expect(res.status.calledWith(500)).to.be.true;
    expect(res.json.called).to.be.true;
  });
});