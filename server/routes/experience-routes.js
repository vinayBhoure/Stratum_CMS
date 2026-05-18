const express = require('express');
const requireAuth = require('../middlewares/require-auth');
const asyncHandler = require('../utils/async-handler');
const validate = require('../middlewares/validate');
const { ExperienceSchema } = require('../schemas/experience-schema');
const {
  getExperiences,
  getExperience,
  createExperience,
  updateExperience,
  deleteExperience,
} = require('../controllers/experience-controller');

const router = express.Router();

router.get('/', ...requireAuth, asyncHandler(getExperiences));
router.get('/:id', ...requireAuth, asyncHandler(getExperience));
router.post('/', ...requireAuth, validate(ExperienceSchema), asyncHandler(createExperience));
router.put('/:id', ...requireAuth, validate(ExperienceSchema), asyncHandler(updateExperience));
router.delete('/:id', ...requireAuth, asyncHandler(deleteExperience));

module.exports = router;
