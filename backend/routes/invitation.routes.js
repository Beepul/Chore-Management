
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const controller = require("../controllers/invitationController")

router.post('/invite', protect, controller.inviteMember);
router.get('/my', protect, controller.getMyInvitations);
router.post('/accept/:invitationId', protect, controller.acceptInvitation);
module.exports = router;
