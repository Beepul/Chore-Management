const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const controller = require("../controllers/settingsController");
const authorizeRoles = require("../middleware/authorizeRoles");

router.put("/profile", authMiddleware.protect, controller.updateProfile);
router.put("/household-name", authMiddleware.protect, authorizeRoles.allow("admin"), controller.updateHouseholdName);
router.put("/password", authMiddleware.protect, controller.changePassword);

module.exports = router;