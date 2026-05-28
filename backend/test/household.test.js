const { expect } = require("chai");
const sinon = require("sinon");

const HouseholdController = require("../controllers/householdController");
const HouseHoldModel = require("../models/HouseHold.model");
const MembershipModel = require("../models/Member.model");

// Mock response object
const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

// Mock request object
const mockReq = ({ body = {}, user = {} } = {}) => {
  return {
    body,
    user,
  };
};

describe("Household Controller Test", () => {
  let res;

  beforeEach(() => {
    res = mockRes();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 400 if household name is missing", async () => {
    const req = mockReq({
      user: {
        _id: "user123",
      },
      body: {
        description: "This is my household",
      },
    });

    await HouseholdController.setupHouseHold(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Please provide all the fields");
  });

  it("should return 400 if household description is missing", async () => {
    const req = mockReq({
      user: {
        _id: "user123",
      },
      body: {
        name: "My Household",
      },
    });

    await HouseholdController.setupHouseHold(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Please provide all the fields");
  });

  it("should return 400 if user already belongs to a household", async () => {
    sinon.stub(MembershipModel, "findOne").resolves({
      _id: "membership123",
      user: "user123",
      household: "house123",
      role: "admin",
      status: "active",
    });

    const req = mockReq({
      user: {
        _id: "user123",
      },
      body: {
        name: "My Household",
        description: "This is my household",
      },
    });

    await HouseholdController.setupHouseHold(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("You already belong to a household");
  });

  it("should create household successfully", async () => {
    sinon.stub(MembershipModel, "findOne").resolves(null);

    const fakeHousehold = {
      _id: "house123",
      name: "My Household",
      description: "This is my household",
      createdBy: "user123",
    };

    const fakeMembership = {
      _id: "membership123",
      user: "user123",
      household: "house123",
      role: "admin",
      status: "active",
    };

    sinon.stub(HouseHoldModel, "create").resolves(fakeHousehold);
    sinon.stub(MembershipModel, "create").resolves(fakeMembership);

    const req = mockReq({
      user: {
        _id: "user123",
      },
      body: {
        name: "My Household",
        description: "This is my household",
      },
    });

    await HouseholdController.setupHouseHold(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.true;
    expect(response.message).to.equal("Household created successfully");
    expect(response.data.household).to.deep.equal(fakeHousehold);
    expect(response.data.membership).to.deep.equal(fakeMembership);
  });
});