const express = require('express');
const healthRouter = require('./health');
const userRouter = require('./user-routes');
const skillRouter = require('./skill-routes');
const projectRouter = require('./project-routes');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/skills', skillRouter);
router.use('/projects', projectRouter);
router.use('/', userRouter);

module.exports = router;
