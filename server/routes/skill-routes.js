const express = require('express');
const requireAuth = require('../middlewares/require-auth');
const asyncHandler = require('../utils/async-handler');
const validate = require('../middlewares/validate');
const { SkillSchema } = require('../schemas/skill-schema');
const { getSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skill-controller');

const router = express.Router();

router.get('/', ...requireAuth, asyncHandler(getSkills));
router.post('/', ...requireAuth, validate(SkillSchema), asyncHandler(createSkill));
router.put('/:id', ...requireAuth, validate(SkillSchema), asyncHandler(updateSkill));
router.delete('/:id', ...requireAuth, asyncHandler(deleteSkill));

module.exports = router;
