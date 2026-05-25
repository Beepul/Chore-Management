const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const expect = chai.expect;

const InvitationCtrl = require("../controllers/invitationController");

const UserModel = require("../models/User.model");
const MemberModel = require("../models/Member.model");
const InvitationModel = require("../models/Invitation.model");

describe("Invitation Controller Tests", () => {
  let res;
  let next;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };

    next = sinon.spy();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("inviteMember()", () => {
    it("should create invitation successfully", async () => {
      const householdId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      const req = {
        body: {
          email: "test@gmail.com",
        },
        user: {
          _id: userId,
        },
      };

      sinon.stub(MemberModel, "findOne").resolves({
        user: userId,
        household: householdId,
        role: "admin",
        status: "active",
      });

      sinon.stub(UserModel, "findOne").resolves(null);
      sinon.stub(InvitationModel, "findOne").resolves(null);
      sinon.stub(jwt, "sign").returns("fake-invitation-token");

      sinon.stub(InvitationModel, "create").resolves({
        _id: new mongoose.Types.ObjectId(),
        household: householdId,
        email: "test@gmail.com",
        status: "pending",
        token: "fake-invitation-token",
      });

      await InvitationCtrl.inviteMember(req, res, next);

      expect(InvitationModel.create.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.called).to.be.true;
      expect(next.called).to.be.false;
    });

    it("should return error when email is missing", async () => {
      const req = {
        body: {},
        user: {
          _id: new mongoose.Types.ObjectId(),
        },
      };

      await InvitationCtrl.inviteMember(req, res, next);

      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: "Please provide email",
        })
      ).to.be.true;
    });

    it("should reject non-admin user", async () => {
      const req = {
        body: {
          email: "test@gmail.com",
        },
        user: {
          _id: new mongoose.Types.ObjectId(),
        },
      };

      sinon.stub(MemberModel, "findOne").resolves({
        role: "user",
        status: "active",
      });

      await InvitationCtrl.inviteMember(req, res, next);

      expect(res.status.calledWith(403)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: "Only household admin can invite members",
        })
      ).to.be.true;
    });
  });

  describe("acceptInvitation()", () => {
    it("should accept invitation successfully", async () => {
      const userId = new mongoose.Types.ObjectId();
      const invitationId = new mongoose.Types.ObjectId();
      const householdId = new mongoose.Types.ObjectId();

      const saveStub = sinon.stub().resolves();

      const req = {
        params: {
          invitationId: invitationId.toString(),
        },
        user: {
          _id: userId,
          email: "test@gmail.com",
        },
      };

      sinon.stub(MemberModel, "findOne").resolves(null);

      sinon.stub(InvitationModel, "findById").resolves({
        _id: invitationId,
        email: "test@gmail.com",
        status: "pending",
        household: householdId,
        expiresAt: new Date(Date.now() + 100000),
        save: saveStub,
      });

      sinon.stub(MemberModel, "create").resolves({
        user: userId,
        household: householdId,
        role: "user",
        status: "active",
      });

      sinon.stub(InvitationModel, "updateMany").resolves();

      await InvitationCtrl.acceptInvitation(req, res, next);

      expect(MemberModel.create.calledOnce).to.be.true;
      expect(saveStub.calledOnce).to.be.true;
      expect(InvitationModel.updateMany.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.called).to.be.true;
      expect(next.called).to.be.false;
    });

    it("should return error if invitation expired", async () => {
      const saveStub = sinon.stub().resolves();

      const req = {
        params: {
          invitationId: new mongoose.Types.ObjectId().toString(),
        },
        user: {
          _id: new mongoose.Types.ObjectId(),
          email: "test@gmail.com",
        },
      };

      sinon.stub(MemberModel, "findOne").resolves(null);

      sinon.stub(InvitationModel, "findById").resolves({
        _id: new mongoose.Types.ObjectId(),
        email: "test@gmail.com",
        status: "pending",
        expiresAt: new Date(Date.now() - 100000),
        save: saveStub,
      });

      await InvitationCtrl.acceptInvitation(req, res, next);

      expect(saveStub.calledOnce).to.be.true;
      expect(res.status.calledWith(400)).to.be.true;
      expect(
        res.json.calledWithMatch({
          message: "This invitation has expired",
        })
      ).to.be.true;
    });
  });
});