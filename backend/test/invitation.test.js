const { expect } = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");

const InvitationController = require("../controllers/invitationController");
const UserModel = require("../models/User.model");
const InvitationModel = require("../models/Invitation.model");
const MemberModel = require("../models/Member.model");

// Mock response object
const mockRes = () => {
  const res = {};
  res.status = sinon.stub().returns(res);
  res.json = sinon.stub().returns(res);
  return res;
};

// Mock request object
const mockReq = ({ body = {}, user = {}, params = {} } = {}) => {
  return {
    body,
    user,
    params,
  };
};

// Helper for async controller methods wrapped by handleAsync
const callController = async (handler, req, res) => {
  const next = sinon.stub();

  const result = handler(req, res, next);

  if (result && typeof result.then === "function") {
    await result;
  }

  await new Promise((resolve) => setImmediate(resolve));
};

describe("Invitation Controller Test", () => {
  let res;

  beforeEach(() => {
    res = mockRes();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should return 400 if invite email is missing", async () => {
    const req = mockReq({
      body: {},
      user: {
        _id: "admin123",
      },
    });

    await callController(InvitationController.inviteMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Please provide email");
  });

  it("should return 400 if admin does not belong to any household", async () => {
    sinon.stub(MemberModel, "findOne").resolves(null);

    const req = mockReq({
      body: {
        email: "member@gmail.com",
      },
      user: {
        _id: "admin123",
      },
    });

    await callController(InvitationController.inviteMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("You do not belong to any household");
  });

  it("should return 403 if user is not household admin", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      user: "user123",
      household: "house123",
      role: "user",
      status: "active",
    });

    const req = mockReq({
      body: {
        email: "member@gmail.com",
      },
      user: {
        _id: "user123",
      },
    });

    await callController(InvitationController.inviteMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Only household admin can invite members");
  });

  it("should return 400 if invited user already belongs to a household", async () => {
    const findOneStub = sinon.stub(MemberModel, "findOne");

    findOneStub.onFirstCall().resolves({
      user: "admin123",
      household: "house123",
      role: "admin",
      status: "active",
    });

    findOneStub.onSecondCall().resolves({
      user: "member123",
      household: "otherHouse123",
      role: "user",
      status: "active",
    });

    sinon.stub(UserModel, "findOne").resolves({
      _id: "member123",
      email: "member@gmail.com",
    });

    const req = mockReq({
      body: {
        email: "member@gmail.com",
      },
      user: {
        _id: "admin123",
      },
    });

    await callController(InvitationController.inviteMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("This user already belongs to a household");
  });

  it("should return 400 if active invitation already exists", async () => {
    const findOneStub = sinon.stub(MemberModel, "findOne");

    findOneStub.onFirstCall().resolves({
      user: "admin123",
      household: "house123",
      role: "admin",
      status: "active",
    });

    sinon.stub(UserModel, "findOne").resolves(null);

    sinon.stub(InvitationModel, "findOne").resolves({
      _id: "invite123",
      email: "member@gmail.com",
      household: "house123",
      status: "pending",
    });

    const req = mockReq({
      body: {
        email: "member@gmail.com",
      },
      user: {
        _id: "admin123",
      },
    });

    await callController(InvitationController.inviteMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("An active invitation already exists for this email");
  });

  it("should create invitation successfully", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      user: "admin123",
      household: "house123",
      role: "admin",
      status: "active",
    });

    sinon.stub(UserModel, "findOne").resolves(null);
    sinon.stub(InvitationModel, "findOne").resolves(null);
    sinon.stub(jwt, "sign").returns("fake.invitation.token");

    const fakeInvitation = {
      _id: "invite123",
      household: "house123",
      email: "member@gmail.com",
      invitedBy: "admin123",
      token: "fake.invitation.token",
      status: "pending",
    };

    sinon.stub(InvitationModel, "create").resolves(fakeInvitation);

    process.env.JWT_SECRET = "testsecret";

    const req = mockReq({
      body: {
        email: "member@gmail.com",
      },
      user: {
        _id: "admin123",
      },
    });

    await callController(InvitationController.inviteMember, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.true;
    expect(response.message).to.equal("Invitation created successfully");
    expect(response.data.invitation).to.deep.equal(fakeInvitation);
    expect(response.data.joinLink).to.include("fake.invitation.token");
  });

  it("should get my invitations successfully", async () => {
    const fakeInvitations = [
      {
        _id: "invite123",
        email: "member@gmail.com",
        status: "pending",
      },
    ];

    const sortStub = sinon.stub().resolves(fakeInvitations);

    const secondPopulateStub = sinon.stub().returns({
      sort: sortStub,
    });

    const firstPopulateStub = sinon.stub().returns({
      populate: secondPopulateStub,
    });

    sinon.stub(InvitationModel, "find").returns({
      populate: firstPopulateStub,
    });

    const req = mockReq({
      user: {
        email: "member@gmail.com",
      },
    });

    await callController(InvitationController.getMyInvitations, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.true;
    expect(response.message).to.equal("Invitations fetched successfully");
    expect(response.data).to.deep.equal(fakeInvitations);
  });

  it("should return 400 if user already belongs to a household while accepting invitation", async () => {
    sinon.stub(MemberModel, "findOne").resolves({
      user: "user123",
      household: "house123",
      role: "user",
      status: "active",
    });

    const req = mockReq({
      user: {
        _id: "user123",
        email: "member@gmail.com",
      },
      params: {
        invitationId: "invite123",
      },
    });

    await callController(InvitationController.acceptInvitation, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("You already belong to a household");
  });

  it("should return 404 if invitation is not found", async () => {
    sinon.stub(MemberModel, "findOne").resolves(null);
    sinon.stub(InvitationModel, "findById").resolves(null);

    const req = mockReq({
      user: {
        _id: "user123",
        email: "member@gmail.com",
      },
      params: {
        invitationId: "invite123",
      },
    });

    await callController(InvitationController.acceptInvitation, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("Invitation not found");
  });

  it("should return 400 if invitation is no longer available", async () => {
    sinon.stub(MemberModel, "findOne").resolves(null);

    sinon.stub(InvitationModel, "findById").resolves({
      _id: "invite123",
      email: "member@gmail.com",
      status: "accepted",
      expiresAt: new Date(Date.now() + 100000),
    });

    const req = mockReq({
      user: {
        _id: "user123",
        email: "member@gmail.com",
      },
      params: {
        invitationId: "invite123",
      },
    });

    await callController(InvitationController.acceptInvitation, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("This invitation is no longer available");
  });

  it("should return 400 if invitation has expired", async () => {
    sinon.stub(MemberModel, "findOne").resolves(null);

    const fakeInvitation = {
      _id: "invite123",
      email: "member@gmail.com",
      status: "pending",
      expiresAt: new Date(Date.now() - 100000),
      save: sinon.stub().resolves(),
    };

    sinon.stub(InvitationModel, "findById").resolves(fakeInvitation);

    const req = mockReq({
      user: {
        _id: "user123",
        email: "member@gmail.com",
      },
      params: {
        invitationId: "invite123",
      },
    });

    await callController(InvitationController.acceptInvitation, req, res);

    const response = res.json.firstCall.args[0];

    expect(fakeInvitation.status).to.equal("expired");
    expect(fakeInvitation.save.calledOnce).to.be.true;
    expect(response.success).to.be.false;
    expect(response.message).to.equal("This invitation has expired");
  });

  it("should return 403 if invitation email does not match logged in user email", async () => {
    sinon.stub(MemberModel, "findOne").resolves(null);

    sinon.stub(InvitationModel, "findById").resolves({
      _id: "invite123",
      email: "another@gmail.com",
      status: "pending",
      expiresAt: new Date(Date.now() + 100000),
    });

    const req = mockReq({
      user: {
        _id: "user123",
        email: "member@gmail.com",
      },
      params: {
        invitationId: "invite123",
      },
    });

    await callController(InvitationController.acceptInvitation, req, res);

    const response = res.json.firstCall.args[0];

    expect(response.success).to.be.false;
    expect(response.message).to.equal("You are not allowed to accept this invitation");
  });

  it("should accept invitation successfully", async () => {
    sinon.stub(MemberModel, "findOne").resolves(null);

    const fakeInvitation = {
      _id: "invite123",
      email: "member@gmail.com",
      household: "house123",
      status: "pending",
      expiresAt: new Date(Date.now() + 100000),
      save: sinon.stub().resolves(),
    };

    const fakeMembership = {
      _id: "membership123",
      user: "user123",
      household: "house123",
      role: "user",
      status: "active",
    };

    sinon.stub(InvitationModel, "findById").resolves(fakeInvitation);
    sinon.stub(MemberModel, "create").resolves(fakeMembership);
    sinon.stub(InvitationModel, "updateMany").resolves();

    const req = mockReq({
      user: {
        _id: "user123",
        email: "member@gmail.com",
      },
      params: {
        invitationId: "invite123",
      },
    });

    await callController(InvitationController.acceptInvitation, req, res);

    const response = res.json.firstCall.args[0];

    expect(fakeInvitation.status).to.equal("accepted");
    expect(fakeInvitation.save.calledOnce).to.be.true;
    expect(response.success).to.be.true;
    expect(response.message).to.equal("Invitation accepted successfully");
    expect(response.data).to.deep.equal(fakeMembership);
  });
});