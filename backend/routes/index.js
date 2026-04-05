const express = require('express');
const authRoutes = require('./auth.routes')
const householdRoutes = require('./household.routes')
const invitationRoutes = require('./invitation.routes')
const memberRoutes = require('./member.routes')
const choreRoutes = require('./chore.routes');
const { getAdminDashboard, getMemberDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const settingsRoutes = require('./settings.routes');

const mainRouter = express.Router();


mainRouter.use('/auth', authRoutes);
mainRouter.use('/household', householdRoutes);
mainRouter.use('/invitation', invitationRoutes);
mainRouter.use('/members', memberRoutes);
mainRouter.use('/chore', choreRoutes);
mainRouter.get('/dashboard/admin', protect, getAdminDashboard);
mainRouter.get('/dashboard/member', protect, getMemberDashboard);
mainRouter.use('/settings', settingsRoutes);

module.exports = mainRouter;