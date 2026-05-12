const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
const controller = require("../controllers/settingsController")

router.put("/profile", protect, controller.updateProfile);
router.put("/household-name", protect, controller.updateHouseholdName);
router.put("/password", protect, controller.changePassword);

module.exports = router;