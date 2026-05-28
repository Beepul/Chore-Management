const { expect } = require("chai");
const sinon = require("sinon");
const ChoreController = require("../controllers/choreController");

// Simple mock response object
const mockRes = () => {
    const res = {};
    res.status = sinon.stub().returns(res);
    res.json = sinon.stub().returns(res);
    return res;
};

// Simple mock request object
const mockReq = ({ user = {}, params = {}, body = {} } = {}) => {
    return {
        user,
        params,
        body,
    };
};

describe("Chore Controller Test", () => {
    let res;
    let choreService;
    let controller;

    beforeEach(() => {
        res = mockRes();

        // Fake service so we do not need real database
        choreService = {
            createChore: sinon.stub(),
            getMainChores: sinon.stub(),
            getAllChores: sinon.stub(),
            getSingleChore: sinon.stub(),
            deleteChore: sinon.stub(),
            updateChore: sinon.stub(),
            updateChoreStatus: sinon.stub(),
        };

        controller = new ChoreController(choreService);
    });

    afterEach(() => {
        sinon.restore();
    });

    it("should create a chore successfully", async () => {
        const fakeChore = {
            _id: "chore123",
            title: "Clean Kitchen",
            category: "Cleaning",
            status: "pending",
        };

        choreService.createChore.resolves(fakeChore);

        const req = mockReq({
            user: { _id: "user123" },
            body: {
                title: "Clean Kitchen",
                description: "Clean the kitchen",
                category: "Cleaning",
                dueDate: "2026-05-30",
                assignedTo: ["user123"],
            },
        });

        await controller.createChore(req, res);

        expect(choreService.createChore.calledOnce).to.be.true;
        expect(choreService.createChore.calledWith("user123", req.body)).to.be.true;

        expect(res.status.calledWith(201)).to.be.true;

        const response = res.json.firstCall.args[0];

        expect(response.success).to.be.true;
        expect(response.message).to.equal("Chore created successfully");
        expect(response.data).to.deep.equal(fakeChore);
    });

    it("should get main chores successfully", async () => {
        const fakeChores = [
            {
                _id: "chore1",
                title: "Clean House",
                parentChore: null,
            },
        ];

        choreService.getMainChores.resolves(fakeChores);

        const req = mockReq({
            user: { _id: "user123" },
        });

        await controller.getMainChores(req, res);

        expect(choreService.getMainChores.calledOnce).to.be.true;
        expect(choreService.getMainChores.calledWith("user123")).to.be.true;

        expect(res.status.calledWith(200)).to.be.true;

        const response = res.json.firstCall.args[0];

        expect(response.success).to.be.true;
        expect(response.message).to.equal("Main chores fetched successfully");
        expect(response.data).to.deep.equal(fakeChores);
    });

    it("should get all chores successfully", async () => {
        const fakeChores = [
            {
                _id: "chore1",
                title: "Clean Kitchen",
            },
            {
                _id: "chore2",
                title: "Wash Dishes",
            },
        ];

        choreService.getAllChores.resolves(fakeChores);

        const req = mockReq({
            user: { _id: "user123" },
        });

        await controller.getAllChores(req, res);

        expect(choreService.getAllChores.calledOnce).to.be.true;
        expect(choreService.getAllChores.calledWith("user123")).to.be.true;

        expect(res.status.calledWith(200)).to.be.true;

        const response = res.json.firstCall.args[0];

        expect(response.success).to.be.true;
        expect(response.message).to.equal("Chores fetched successfully");
        expect(response.data).to.deep.equal(fakeChores);
    });

    it("should get a single chore successfully", async () => {
        const fakeData = {
            chore: {
                _id: "chore123",
                title: "Clean Room",
            },
            subChores: [
                {
                    _id: "sub123",
                    title: "Clean Table",
                },
            ],
        };

        choreService.getSingleChore.resolves(fakeData);

        const req = mockReq({
            user: { _id: "user123" },
            params: { id: "chore123" },
        });

        await controller.getSingleChore(req, res);

        expect(choreService.getSingleChore.calledOnce).to.be.true;
        expect(
            choreService.getSingleChore.calledWith("user123", "chore123")
        ).to.be.true;

        expect(res.status.calledWith(200)).to.be.true;

        const response = res.json.firstCall.args[0];

        expect(response.success).to.be.true;
        expect(response.message).to.equal("Chore details fetched successfully");
        expect(response.data).to.deep.equal(fakeData);
    });

    it("should delete a chore successfully", async () => {
        choreService.deleteChore.resolves(null);

        const req = mockReq({
            user: { _id: "user123" },
            params: { id: "chore123" },
        });

        await controller.deleteChore(req, res);

        expect(choreService.deleteChore.calledOnce).to.be.true;
        expect(choreService.deleteChore.calledWith("user123", "chore123")).to.be.true;

        expect(res.status.calledWith(200)).to.be.true;

        const response = res.json.firstCall.args[0];

        expect(response.success).to.be.true;
        expect(response.message).to.equal("Chore deleted successfully");
        expect(response.data).to.equal(null);
    });

    it("should update a chore successfully", async () => {
        const updatedChore = {
            _id: "chore123",
            title: "Updated Chore",
            category: "Cleaning",
        };

        choreService.updateChore.resolves(updatedChore);

        const req = mockReq({
            user: { _id: "user123" },
            params: { id: "chore123" },
            body: {
                title: "Updated Chore",
                description: "Updated description",
                category: "Cleaning",
                dueDate: "2026-05-30",
                assignedTo: ["user123"],
            },
        });

        await controller.updateChore(req, res);

        expect(choreService.updateChore.calledOnce).to.be.true;
        expect(
            choreService.updateChore.calledWith("user123", "chore123", req.body)
        ).to.be.true;

        expect(res.status.calledWith(200)).to.be.true;

        const response = res.json.firstCall.args[0];

        expect(response.success).to.be.true;
        expect(response.message).to.equal("Chore updated successfully");
        expect(response.data).to.deep.equal(updatedChore);
    });

    it("should update chore status successfully", async () => {
        const updatedChore = {
            _id: "chore123",
            title: "Clean Room",
            status: "completed",
        };

        choreService.updateChoreStatus.resolves(updatedChore);

        const req = mockReq({
            user: { _id: "user123" },
            params: { id: "chore123" },
            body: {
                status: "completed",
            },
        });

        await controller.updateChoreStatus(req, res);

        expect(choreService.updateChoreStatus.calledOnce).to.be.true;
        expect(
            choreService.updateChoreStatus.calledWith("user123", "chore123", req.body)
        ).to.be.true;

        expect(res.status.calledWith(200)).to.be.true;

        const response = res.json.firstCall.args[0];

        expect(response.success).to.be.true;
        expect(response.message).to.equal("Chore status updated successfully");
        expect(response.data).to.deep.equal(updatedChore);
    });
});