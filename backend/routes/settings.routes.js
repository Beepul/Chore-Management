const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { updateProfile, updateHouseholdName, changePassword } = require("../controllers/settingsController");
const router = express.Router();

router.put("/profile", protect, updateProfile);
router.put("/household-name", protect, updateHouseholdName);
router.put("/password", protect, changePassword);

module.exports = router;