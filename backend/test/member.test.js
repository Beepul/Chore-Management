const { expect } = require("chai");
const sinon = require("sinon");

const MemberController = require("../controllers/memberController");
const MemberModel = require("../models/Member.model");

// Mock response object
const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

// Mock request object
const mockReq = ({ user = {}, params = {} } = {}) => {
  return {
    user,
    params,
  };
};

// Helper for controller methods wrapped with handleAsync
const callController = async (handler, req, res) => {
  const next = sinon.stub();

  const result = handler(req, res, next);

  if (result && typeof result.then === "function") {
    await result;
  }

  await new Promise((resolve) => setImmediate(resolve));
};

describe("Member Controller Test", () => {
  let res;

  beforeEach(() => {
    res = mockRes();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 400 if user does not belong to any household", async () => {
    sinon.stub(MemberModel, "findOne").resolves(null);

    const req = mockReq({
      user: {
        _id: "user123",
      },
    });

    await callController(MemberController.getMembers, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("You do not belong to any household");
  });

  it("should get members successfully", async () => {
    const currentMembership = {
      _id: "membership123",
      user: "user123",
      household: "house123",
      role: "admin",
      status: "active",
    };

    const fakeMembers = [
      {
        _id: "member1",
        user: {
          fullname: "Test User One",
          email: "one@gmail.com",
        },
        household: "house123",
        role: "admin",
        status: "active",
      },
      {
        _id: "member2",
        user: {
          fullname: "Test User Two",
          email: "two@gmail.com",
        },
        household: "house123",
        role: "user",
        status: "active",
      },
    ];

    const findStub = sinon.stub(MemberModel, "findOne").resolves(currentMembership);

    const sortStub = sinon.stub().resolves(fakeMembers);

    const populateStub = sinon.stub().returns({
      sort: sortStub,
    });

    sinon.stub(MemberModel, "find").returns({
      populate: populateStub,
    });

    const req = mockReq({
      user: {
        _id: "user123",
      },
    });

    await callController(MemberController.getMembers, req, res);

    const response = res.json.firstCall.args[0];

    expect(findStub.calledOnce).to.be.true;
    expect(response.success).to.be.true;
    expect(response.message).to.equal("Members fetched successfully");
    expect(response.data).to.deep.equal(fakeMembers);
  });

  it("should return 400 if user does not belong to any household while removing member", async () => {
    sinon.stub(MemberModel, "findOne").resolves(null);

    const req = mockReq({
      user: {
        _id: "admin123",
      },
      params: {
        memberId: "member123",
      },
    });

    await callController(MemberController.removeMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("You do not belong to any household");
  });

  it("should return 403 if user is not admin", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      _id: "membership123",
      user: "user123",
      household: "house123",
      role: "user",
      status: "active",
    });

    const req = mockReq({
      user: {
        _id: "user123",
      },
      params: {
        memberId: "member123",
      },
    });

    await callController(MemberController.removeMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Only admin can remove members");
  });

  it("should return 404 if member is not found", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      _id: "adminMembership123",
      user: "admin123",
      household: "house123",
      role: "admin",
      status: "active",
    });

    sinon.stub(MemberModel, "findById").returns({
      populate: sinon.stub().resolves(null),
    });

    const req = mockReq({
      user: {
        _id: "admin123",
      },
      params: {
        memberId: "member123",
      },
    });

    await callController(MemberController.removeMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Member not found");
  });

  it("should return 403 if member belongs to another household", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      _id: "adminMembership123",
      user: "admin123",
      household: {
        toString: () => "house123",
      },
      role: "admin",
      status: "active",
    });

    const memberToRemove = {
      _id: "member123",
      household: {
        toString: () => "anotherHouse123",
      },
      user: {
        _id: {
          toString: () => "user123",
        },
        fullname: "Normal User",
        email: "user@gmail.com",
      },
      role: "user",
      status: "active",
    };

    sinon.stub(MemberModel, "findById").returns({
      populate: sinon.stub().resolves(memberToRemove),
    });

    const req = mockReq({
      user: {
        _id: {
          toString: () => "admin123",
        },
      },
      params: {
        memberId: "member123",
      },
    });

    await callController(MemberController.removeMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal(
      "You can only remove members from your own household"
    );
  });

  it("should return 400 if admin tries to remove themselves", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      _id: "adminMembership123",
      user: "admin123",
      household: {
        toString: () => "house123",
      },
      role: "admin",
      status: "active",
    });

    const memberToRemove = {
      _id: "member123",
      household: {
        toString: () => "house123",
      },
      user: {
        _id: {
          toString: () => "admin123",
        },
        fullname: "Admin User",
        email: "admin@gmail.com",
      },
      role: "admin",
      status: "active",
    };

    sinon.stub(MemberModel, "findById").returns({
      populate: sinon.stub().resolves(memberToRemove),
    });

    const req = mockReq({
      user: {
        _id: {
          toString: () => "admin123",
        },
      },
      params: {
        memberId: "member123",
      },
    });

    await callController(MemberController.removeMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Admin cannot remove themselves");
  });

  it("should return 400 if trying to remove another admin", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      _id: "adminMembership123",
      user: "admin123",
      household: {
        toString: () => "house123",
      },
      role: "admin",
      status: "active",
    });

    const memberToRemove = {
      _id: "member123",
      household: {
        toString: () => "house123",
      },
      user: {
        _id: {
          toString: () => "anotherAdmin123",
        },
        fullname: "Another Admin",
        email: "anotheradmin@gmail.com",
      },
      role: "admin",
      status: "active",
    };

    sinon.stub(MemberModel, "findById").returns({
      populate: sinon.stub().resolves(memberToRemove),
    });

    const req = mockReq({
      user: {
        _id: {
          toString: () => "admin123",
        },
      },
      params: {
        memberId: "member123",
      },
    });

    await callController(MemberController.removeMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Admin cannot be removed");
  });

  it("should remove member successfully", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      _id: "adminMembership123",
      user: "admin123",
      household: {
        toString: () => "house123",
      },
      role: "admin",
      status: "active",
    });

    const memberToRemove = {
      _id: "member123",
      household: {
        toString: () => "house123",
      },
      user: {
        _id: {
          toString: () => "user123",
        },
        fullname: "Normal User",
        email: "user@gmail.com",
      },
      role: "user",
      status: "active",
      save: sinon.stub().resolves(),
    };

    sinon.stub(MemberModel, "findById").returns({
      populate: sinon.stub().resolves(memberToRemove),
    });

    const req = mockReq({
      user: {
        _id: {
          toString: () => "admin123",
        },
      },
      params: {
        memberId: "member123",
      },
    });

    await callController(MemberController.removeMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(memberToRemove.status).to.equal("removed");
    expect(memberToRemove.save.calledOnce).to.be.true;
    expect(response.success).to.be.true;
    expect(response.message).to.equal("Normal User has been removed successfully");
    expect(response.data).to.equal(null);
  });
});