const { z } = require('zod');

const ExperienceSchema = z
  .object({
    company: z.string().min(1, 'Company is required').max(100, 'Company must be 100 characters or fewer'),
    role: z.string().min(1, 'Role is required').max(100, 'Role must be 100 characters or fewer'),
    startDate: z.string().datetime({ message: 'startDate must be a valid ISO 8601 date' }),
    endDate: z
      .string()
      .datetime({ message: 'endDate must be a valid ISO 8601 date' })
      .nullable()
      .optional(),
    description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
    skillIds: z.array(z.string().uuid('Each skillId must be a valid UUID')).optional().default([]),
  })
  .refine(
    (data) => {
      if (!data.endDate) { return true; }
      return new Date(data.endDate) > new Date(data.startDate);
    },
    { message: 'endDate must be after startDate', path: ['endDate'] }
  );

module.exports = { ExperienceSchema };
