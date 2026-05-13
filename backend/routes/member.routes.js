
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();
const controller = require("../controllers/memberController");
const authorizeRoles = require('../middleware/authorizeRoles');

router.get('/', authMiddleware.protect, controller.getMembers);
router.delete('/:memberId', authMiddleware.protect, authorizeRoles.allow("admin"), controller.removeMember);

module.exports = router;
