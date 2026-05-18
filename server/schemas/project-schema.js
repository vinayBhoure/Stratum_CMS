const { z } = require('zod');

const ProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  mediaUrl: z.string().url('mediaUrl must be a valid URL').optional().or(z.literal('')),
  githubUrl: z.string().url('githubUrl must be a valid URL').optional().or(z.literal('')),
  liveUrl: z.string().url('liveUrl must be a valid URL').optional().or(z.literal('')),
  tags: z.array(z.string().min(1)).optional().default([]),
  skillIds: z.array(z.string().uuid('Each skillId must be a valid UUID')).optional().default([]),
});

module.exports = { ProjectSchema };
