
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const controller = require("../controllers/invitationController");
const authorizeRoles = require('../middleware/authorizeRoles');

router.post('/invite', authMiddleware.protect, authorizeRoles.allow("admin"), controller.inviteMember);
router.get('/my', authMiddleware.protect, controller.getMyInvitations);
router.post('/accept/:invitationId', authMiddleware.protect, controller.acceptInvitation);
module.exports = router;
