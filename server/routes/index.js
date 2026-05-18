const express = require('express');
const healthRouter = require('./health');
const userRouter = require('./user-routes');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/', userRouter);

module.exports = router;
