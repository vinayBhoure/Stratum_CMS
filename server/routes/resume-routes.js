const express = require('express');
const requireAuth = require('../middlewares/require-auth');
const asyncHandler = require('../utils/async-handler');
const uploadSingle = require('../middlewares/upload');
const { genericUpload, getResume, upsertResume, deleteResume } = require('../controllers/resume-controller');

const router = express.Router();

// Generic upload (any allowed file type)
router.post('/upload', ...requireAuth, uploadSingle, asyncHandler(genericUpload));

// Resume (single record per user)
router.get('/resume', ...requireAuth, asyncHandler(getResume));
router.post('/resume', ...requireAuth, uploadSingle, asyncHandler(upsertResume));
router.delete('/resume', ...requireAuth, asyncHandler(deleteResume));

module.exports = router;
