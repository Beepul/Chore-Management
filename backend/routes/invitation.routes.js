
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { inviteMember, getMyInvitations, acceptInvitation } = require('../controllers/invitationController');
const router = express.Router();

router.post('/invite', protect, inviteMember);
router.get('/my', protect, getMyInvitations);
router.post('/accept/:invitationId', protect, acceptInvitation);
module.exports = router;
