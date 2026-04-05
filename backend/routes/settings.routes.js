const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { updateProfile, updateHouseholdName } = require("../controllers/settingsController");
const router = express.Router();

router.put("/profile", protect, updateProfile);
router.put("/household-name", protect, updateHouseholdName);

module.exports = router;