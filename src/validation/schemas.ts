import { z } from 'zod';

const MAX_STRING_LENGTH = 1000;
const MAX_BIO_LENGTH = 5000;
const MAX_DESCRIPTION_LENGTH = 10000;

export const BannerSchema = z.object({
  banner_title: z.string().trim().min(1, 'Banner title is required').max(MAX_STRING_LENGTH),
  banner_description: z.string().trim().min(1, 'Banner description is required').max(MAX_DESCRIPTION_LENGTH),
  banner_url: z.string().trim().min(1, 'Banner URL is required'),
});

export const SpeakerSchema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(MAX_STRING_LENGTH),
  middle_name: z.string().trim().max(MAX_STRING_LENGTH).nullable().optional(),
  last_name: z.string().trim().max(MAX_STRING_LENGTH).nullable().optional(),
  bio: z.string().trim().min(1, 'Bio is required').max(MAX_BIO_LENGTH),
  headshot_img_url: z.string().trim().min(1, 'Headshot image URL is required'),
});

export const EventSchema = z.object({
  event_title: z.string().trim().min(1, 'Event title is required').max(MAX_STRING_LENGTH),
  event_description: z.string().trim().min(1, 'Event description is required').max(MAX_DESCRIPTION_LENGTH),
  thumbnail_url: z.string().trim().min(1, 'Thumbnail URL is required'),
  tags: z.array(z.string().trim().max(100)).default([]),
});

export const SponsorSchema = z.object({
  sponsor_name: z.string().trim().min(1, 'Sponsor name is required').max(MAX_STRING_LENGTH),
  sponsor_tier: z.enum(['platinum', 'gold', 'silver', 'bronze'], {
    errorMap: () => ({ message: 'Sponsor tier must be platinum, gold, silver, or bronze' }),
  }),
  sponsor_logo: z.string().trim().min(1, 'Sponsor logo URL is required'),
});

const ALLOWED_EMAIL_DOMAINS = ['@asu.edu', '@gmail.com'];

export const RegistrationSchema = z
  .object({
    first_name: z.string().trim().min(1, 'First name is required').max(MAX_STRING_LENGTH),
    middle_name: z.string().trim().max(MAX_STRING_LENGTH).nullable().optional(),
    last_name: z.string().trim().min(1, 'Last name is required').max(MAX_STRING_LENGTH),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required')
      .email('Invalid email format')
      .max(MAX_STRING_LENGTH)
      .refine(
        (email) => ALLOWED_EMAIL_DOMAINS.some((domain) => email.toLowerCase().endsWith(domain)),
        { message: 'Email must be from @asu.edu or @gmail.com domain' }
      ),
    academic_year: z.enum(['Freshman', 'Sophomore', 'Junior', 'Senior', "Master's", 'PhD', 'Staff'], {
      errorMap: () => ({
        message: "Academic year must be Freshman, Sophomore, Junior, Senior, Master's, PhD, or Staff",
      }),
    }),
    major: z.string().trim().max(MAX_STRING_LENGTH).optional(),
    field_of_study: z.string().trim().max(MAX_STRING_LENGTH).optional(),
    why_attend: z.string().trim().max(MAX_DESCRIPTION_LENGTH),
    photo_release: z.boolean().refine((val) => val === true, {
      message: 'Photo release must be acknowledged',
    }),
    relevant_courses: z
      .array(z.string().trim().max(100, 'Each course name must be 100 characters or less'))
      .optional(),
    prior_work_exp: z.string().trim().max(MAX_DESCRIPTION_LENGTH).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.academic_year === 'Staff') {
      // Staff requires field_of_study but not major
      if (!data.field_of_study || data.field_of_study.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Field of study is required for Staff',
          path: ['field_of_study'],
        });
      }
    } else {
      // Non-staff requires major and why_attend
      if (!data.major || data.major.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Major is required',
          path: ['major'],
        });
      }
      if (!data.why_attend || data.why_attend.length < 500) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Why attend must be at least 500 characters',
          path: ['why_attend'],
        });
      }
    }
  });

export const RegistrationUpdateSchema = z.object({
  is_waitlisted: z.boolean().optional(),
  is_approved: z.boolean().optional(),
  is_rejected: z.boolean().optional(),
});

export type BannerInput = z.infer<typeof BannerSchema>;
export type SpeakerInput = z.infer<typeof SpeakerSchema>;
export type EventInput = z.infer<typeof EventSchema>;
export type SponsorInput = z.infer<typeof SponsorSchema>;
export type RegistrationInput = z.infer<typeof RegistrationSchema>;
export type RegistrationUpdateInput = z.infer<typeof RegistrationUpdateSchema>;
