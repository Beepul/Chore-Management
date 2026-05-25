const chai = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");

const expect = chai.expect;

const InvitationCtrl = require("../controllers/invitationController");

const UserModel = require("../models/User.model");
const MemberModel = require("../models/Member.model");
const InvitationModel = require("../models/Invitation.model");

describe("Invitation Controller Tests", () => {

    let res;

    beforeEach(() => {
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("inviteMember()", () => {

        it("should create invitation successfully", async () => {

            const householdId = new mongoose.Types.ObjectId();

            const req = {
                body: {
                    email: "test@gmail.com"
                },
                user: {
                    _id: new mongoose.Types.ObjectId()
                }
            };

            sinon.stub(MemberModel, "findOne")
                .onFirstCall()
                .resolves({
                    household: householdId,
                    role: "admin"
                })
                .onSecondCall()
                .resolves(null);

            sinon.stub(UserModel, "findOne").resolves(null);

            sinon.stub(InvitationModel, "findOne").resolves(null);

            sinon.stub(InvitationModel, "create").resolves({
                _id: new mongoose.Types.ObjectId(),
                email: "test@gmail.com",
                status: "pending"
            });

            await InvitationCtrl.inviteMember(req, res);

            expect(InvitationModel.create.calledOnce).to.be.true;

            expect(res.status.called).to.be.true;
        });

        it("should return error when email is missing", async () => {

            const req = {
                body: {},
                user: {
                    _id: new mongoose.Types.ObjectId()
                }
            };

            const sendErrorStub = sinon.stub(
                InvitationCtrl,
                "sendError"
            );

            await InvitationCtrl.inviteMember(req, res);

            expect(sendErrorStub.calledOnce).to.be.true;

            expect(
                sendErrorStub.firstCall.args[1]
            ).to.equal("Please provide email");
        });

        it("should reject non-admin user", async () => {

            const req = {
                body: {
                    email: "test@gmail.com"
                },
                user: {
                    _id: new mongoose.Types.ObjectId()
                }
            };

            sinon.stub(MemberModel, "findOne").resolves({
                role: "user"
            });

            const sendErrorStub = sinon.stub(
                InvitationCtrl,
                "sendError"
            );

            await InvitationCtrl.inviteMember(req, res);

            expect(sendErrorStub.calledOnce).to.be.true;

            expect(
                sendErrorStub.firstCall.args[1]
            ).to.equal(
                "Only household admin can invite members"
            );
        });

    });

    describe("acceptInvitation()", () => {

        it("should accept invitation successfully", async () => {

            const userId = new mongoose.Types.ObjectId();

            const req = {
                params: {
                    invitationId: new mongoose.Types.ObjectId()
                },
                user: {
                    _id: userId,
                    email: "test@gmail.com"
                }
            };

            sinon.stub(MemberModel, "findOne").resolves(null);

            sinon.stub(InvitationModel, "findById").resolves({
                _id: new mongoose.Types.ObjectId(),
                email: "test@gmail.com",
                status: "pending",
                household: new mongoose.Types.ObjectId(),
                expiresAt: new Date(Date.now() + 100000),
                save: sinon.stub().resolves()
            });

            sinon.stub(MemberModel, "create").resolves({
                user: userId,
                role: "user"
            });

            sinon.stub(InvitationModel, "updateMany").resolves();

            await InvitationCtrl.acceptInvitation(req, res);

            expect(MemberModel.create.calledOnce).to.be.true;

            expect(
                InvitationModel.updateMany.calledOnce
            ).to.be.true;
        });

        it("should return error if invitation expired", async () => {

            const req = {
                params: {
                    invitationId: new mongoose.Types.ObjectId()
                },
                user: {
                    _id: new mongoose.Types.ObjectId(),
                    email: "test@gmail.com"
                }
            };

            sinon.stub(MemberModel, "findOne").resolves(null);

            sinon.stub(InvitationModel, "findById").resolves({
                email: "test@gmail.com",
                status: "pending",
                expiresAt: new Date(Date.now() - 100000),
                save: sinon.stub().resolves()
            });

            const sendErrorStub = sinon.stub(
                InvitationCtrl,
                "sendError"
            );

            await InvitationCtrl.acceptInvitation(req, res);

            expect(sendErrorStub.calledOnce).to.be.true;

            expect(
                sendErrorStub.firstCall.args[1]
            ).to.equal(
                "This invitation has expired"
            );
        });

    });

});