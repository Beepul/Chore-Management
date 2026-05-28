const { expect } = require("chai");
const sinon = require("sinon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");
const MemberModel = require("../models/Member.model");
const AuthController = require("../controllers/authController");

const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

const mockReq = ({ body = {}, user = {} } = {}) => {
  return {
    body,
    user,
  };
};

describe("Auth Controller Test", () => {
  let res;

  beforeEach(() => {
    res = mockRes();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 400 if register credentials are missing", async () => {
    const req = mockReq({
      body: {
        fullname: "Test User",
        email: "test@gmail.com",
      },
    });

    await AuthController.registerUser(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Please provide all the credentials");
  });

  it("should return 400 if password and confirm password do not match", async () => {
    const req = mockReq({
      body: {
        fullname: "Test User",
        email: "test@gmail.com",
        password: "123456",
        confirmPassword: "wrong",
      },
    });

    await AuthController.registerUser(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Password doesnot match");
  });

  it("should return 400 if user already exists", async () => {
    sinon.stub(User, "findOne").resolves({
      _id: "user123",
      email: "test@gmail.com",
    });

    const req = mockReq({
      body: {
        fullname: "Test User",
        email: "test@gmail.com",
        password: "123456",
        confirmPassword: "123456",
      },
    });

    await AuthController.registerUser(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("User already exists");
  });

  it("should register user successfully", async () => {
    sinon.stub(User, "findOne").resolves(null);
    sinon.stub(bcrypt, "genSalt").resolves("salt");
    sinon.stub(bcrypt, "hash").resolves("hashedPassword");
    sinon.stub(User, "create").resolves({
      _id: "user123",
      fullname: "Test User",
      email: "test@gmail.com",
      password: "hashedPassword",
    });

    const req = mockReq({
      body: {
        fullname: "Test User",
        email: "test@gmail.com",
        password: "123456",
        confirmPassword: "123456",
      },
    });

    await AuthController.registerUser(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.true;
  });

  it("should return 400 if login credentials are missing", async () => {
    const req = mockReq({
      body: {
        email: "test@gmail.com",
      },
    });

    await AuthController.loginUser(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Please provide all credentials");
  });

  it("should return 401 if user email does not exist", async () => {
    sinon.stub(User, "findOne").resolves(null);

    const req = mockReq({
      body: {
        email: "unknown@gmail.com",
        password: "123456",
      },
    });

    await AuthController.loginUser(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("User with this email doesnot exist");
  });

  it("should return 401 if password is incorrect", async () => {
    sinon.stub(User, "findOne").resolves({
      _id: "user123",
      fullname: "Test User",
      email: "test@gmail.com",
      password: "hashedPassword",
    });

    sinon.stub(bcrypt, "compare").resolves(false);

    const req = mockReq({
      body: {
        email: "test@gmail.com",
        password: "wrongPassword",
      },
    });

    await AuthController.loginUser(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Credentials do not match, please try again");
  });

  it("should login user successfully", async () => {
    sinon.stub(User, "findOne").resolves({
      _id: "user123",
      fullname: "Test User",
      email: "test@gmail.com",
      password: "hashedPassword",
    });

    sinon.stub(bcrypt, "compare").resolves(true);
    sinon.stub(jwt, "sign").returns("fake.jwt.token");

    process.env.JWT_SECRET = "testsecret";

    const req = mockReq({
      body: {
        email: "test@gmail.com",
        password: "123456",
      },
    });

    await AuthController.loginUser(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.true;
    expect(response.message).to.equal("You have been logged in successfully");
    expect(response.data.email).to.equal("test@gmail.com");
    expect(response.data.token).to.equal("fake.jwt.token");
  });

  it("should return 400 if profile user is not found", async () => {
    sinon.stub(User, "findById").resolves(null);

    const req = mockReq({
      user: {
        id: "user123",
      },
    });

    await AuthController.getProfile(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("User not found");
  });

  it("should get profile successfully when user has household", async () => {
    sinon.stub(User, "findById").resolves({
      _id: "user123",
      fullname: "Test User",
      email: "test@gmail.com",
    });

    const fakeMembership = {
      role: "admin",
      household: {
        _id: "house123",
        name: "My Household",
      },
    };

    sinon.stub(MemberModel, "findOne").returns({
      populate: sinon.stub().resolves(fakeMembership),
    });

    const req = mockReq({
      user: {
        id: "user123",
        fullname: "Test User",
        email: "test@gmail.com",
      },
    });

    await AuthController.getProfile(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.true;
    expect(response.message).to.equal("User profile fetched successfully");
    expect(response.data.role).to.equal("admin");
    expect(response.data.hasHousehold).to.be.true;
    expect(response.data.isNewUser).to.be.false;
  });

  it("should get profile successfully when user has no household", async () => {
    sinon.stub(User, "findById").resolves({
      _id: "user123",
      fullname: "Test User",
      email: "test@gmail.com",
    });

    sinon.stub(MemberModel, "findOne").returns({
      populate: sinon.stub().resolves(null),
    });

    const req = mockReq({
      user: {
        id: "user123",
        fullname: "Test User",
        email: "test@gmail.com",
      },
    });

    await AuthController.getProfile(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.true;
    expect(response.message).to.equal("User profile fetched successfully");
    expect(response.data.household).to.equal(null);
    expect(response.data.role).to.equal(null);
    expect(response.data.hasHousehold).to.be.false;
    expect(response.data.isNewUser).to.be.true;
  });
});