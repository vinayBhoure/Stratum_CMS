const express = require('express');
const healthRouter = require('./health');
const userRouter = require('./user-routes');
const skillRouter = require('./skill-routes');
const projectRouter = require('./project-routes');
const experienceRouter = require('./experience-routes');
const contactRouter = require('./contact-routes');
const resumeRouter = require('./resume-routes');
const publicRouter = require('./public-routes');

const router = express.Router();

// Fixed-path routes first — must precede the :username wildcard router
router.use('/health', healthRouter);
router.use('/skills', skillRouter);
router.use('/projects', projectRouter);
router.use('/experience', experienceRouter);
router.use('/', resumeRouter);
router.use('/', contactRouter);

// Public :username routes last to avoid shadowing fixed paths
router.use('/', publicRouter);
router.use('/', userRouter);

module.exports = router;
