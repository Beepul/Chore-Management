
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const controller = require("../controllers/memberController")

router.get('/', protect, controller.getMembers);
router.delete('/:memberId', protect, controller.removeMember);

module.exports = router;
