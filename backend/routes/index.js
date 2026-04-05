const express = require('express');
const authRoutes = require('./auth.routes')
const householdRoutes = require('./household.routes')
const invitationRoutes = require('./invitation.routes')
const memberRoutes = require('./member.routes')
const choreRoutes = require('./chore.routes');

const mainRouter = express.Router();


mainRouter.use('/auth', authRoutes);
mainRouter.use('/household', householdRoutes);
mainRouter.use('/invitation', invitationRoutes);
mainRouter.use('/members', memberRoutes);
mainRouter.use('/chore', choreRoutes);

module.exports = mainRouter;