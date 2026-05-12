
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const controller = require("../controllers/householdController")

router.post('/setup', protect, controller.setupHouseHold);
module.exports = router;
