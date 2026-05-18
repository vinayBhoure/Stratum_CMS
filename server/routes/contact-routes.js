const express = require('express');
const requireAuth = require('../middlewares/require-auth');
const asyncHandler = require('../utils/async-handler');
const validate = require('../middlewares/validate');
const { ContactSchema, SocialAccountSchema } = require('../schemas/contact-schema');
const {
  getContact,
  upsertContact,
  deleteContact,
  getSocialAccounts,
  createSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,
} = require('../controllers/contact-controller');

const router = express.Router();

// Contact (one per user)
router.get('/contact', ...requireAuth, asyncHandler(getContact));
router.post('/contact', ...requireAuth, validate(ContactSchema), asyncHandler(upsertContact));
router.delete('/contact', ...requireAuth, asyncHandler(deleteContact));

// Social accounts
router.get('/social-accounts', ...requireAuth, asyncHandler(getSocialAccounts));
router.post('/social-accounts', ...requireAuth, validate(SocialAccountSchema), asyncHandler(createSocialAccount));
router.put('/social-accounts/:id', ...requireAuth, validate(SocialAccountSchema), asyncHandler(updateSocialAccount));
router.delete('/social-accounts/:id', ...requireAuth, asyncHandler(deleteSocialAccount));

module.exports = router;
