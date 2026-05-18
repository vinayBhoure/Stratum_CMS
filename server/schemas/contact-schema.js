const { z } = require('zod');

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
  email: z.string().email('Must be a valid email address'),
  mobile: z.string().max(20, 'Mobile must be 20 characters or fewer').optional(),
  address: z.string().max(200, 'Address must be 200 characters or fewer').optional(),
  googleMapsUrl: z.string().url('googleMapsUrl must be a valid URL').optional().or(z.literal('')),
});

const SocialAccountSchema = z.object({
  platform: z.string().min(1, 'Platform is required').max(50, 'Platform must be 50 characters or fewer'),
  url: z.string().url('URL must be a valid URL'),
});

module.exports = { ContactSchema, SocialAccountSchema };
