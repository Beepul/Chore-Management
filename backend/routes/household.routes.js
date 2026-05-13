
const express = require('express');
const router = express.Router();
const controller = require("../controllers/householdController")
const authMiddleware = require("../middleware/authMiddleware")

router.post('/setup', authMiddleware.protect, controller.setupHouseHold);
module.exports = router;
