
const express = require('express');
const { setupHouseHold } = require('../controllers/householdController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/setup', protect, setupHouseHold);
module.exports = router;
