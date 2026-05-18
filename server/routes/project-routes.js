const express = require('express');
const requireAuth = require('../middlewares/require-auth');
const asyncHandler = require('../utils/async-handler');
const validate = require('../middlewares/validate');
const { ProjectSchema } = require('../schemas/project-schema');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/project-controller');

const router = express.Router();

router.get('/', ...requireAuth, asyncHandler(getProjects));
router.get('/:id', ...requireAuth, asyncHandler(getProject));
router.post('/', ...requireAuth, validate(ProjectSchema), asyncHandler(createProject));
router.put('/:id', ...requireAuth, validate(ProjectSchema), asyncHandler(updateProject));
router.delete('/:id', ...requireAuth, asyncHandler(deleteProject));

module.exports = router;
