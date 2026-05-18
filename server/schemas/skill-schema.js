const { z } = require('zod');

const SkillSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer'),
});

module.exports = { SkillSchema };
