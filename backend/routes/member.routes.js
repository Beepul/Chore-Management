
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMembers, removeMember } = require('../controllers/memberController');
const router = express.Router();

router.get('/', protect, getMembers);
router.delete('/:memberId', protect, removeMember);

module.exports = router;
