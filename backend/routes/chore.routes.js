const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/authorizeRoles");

// FIX 1: Import the Factory instead of the Controller directly
const ChoreFactory = require("../factories/choreFactory");

// FIX 2: Use the Factory to create the fully wired controller
const controller = ChoreFactory.createController();

router.get("/main", authMiddleware.protect, controller.getMainChores);
router.get("/", authMiddleware.protect, controller.getAllChores);
router.get("/:id", authMiddleware.protect, controller.getSingleChore);
router.post("/create", authMiddleware.protect, authorizeRoles.allow("admin"), controller.createChore);
router.delete("/:id", authMiddleware.protect, authorizeRoles.allow("admin"), controller.deleteChore);
router.put("/:id", authMiddleware.protect, authorizeRoles.allow("admin"), controller.updateChore);
router.patch("/:id/status", authMiddleware.protect, controller.updateChoreStatus);

module.exports = router;