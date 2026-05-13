const express = require('express');
const authRoutes = require('./auth.routes')
const householdRoutes = require('./household.routes')
const invitationRoutes = require('./invitation.routes')
const memberRoutes = require('./member.routes')
const choreRoutes = require('./chore.routes');
const dashboardCtrl = require('../controllers/dashboardController')
const settingsRoutes = require('./settings.routes');
const authMiddleware = require("../middleware/authMiddleware")

const mainRouter = express.Router();


mainRouter.use('/auth', authRoutes);
mainRouter.use('/household', householdRoutes);
mainRouter.use('/invitation', invitationRoutes);
mainRouter.use('/members', memberRoutes);
mainRouter.use('/chore', choreRoutes);
mainRouter.get('/dashboard/admin', authMiddleware.protect, dashboardCtrl.getAdminDashboard);
mainRouter.get('/dashboard/member', authMiddleware.protect, dashboardCtrl.getMemberDashboard);
mainRouter.use('/settings', settingsRoutes);

module.exports = mainRouter;