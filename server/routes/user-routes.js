const express = require('express');
const requireAuth = require('../middlewares/require-auth');
const asyncHandler = require('../utils/async-handler');
const { getMe } = require('../controllers/user-controller');

const router = express.Router();

router.get('/me', ...requireAuth, asyncHandler(getMe));

module.exports = router;
