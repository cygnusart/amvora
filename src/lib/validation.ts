import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .refine(email => email.endsWith('@gmail.com') || email.endsWith('@yahoo.com') || email.endsWith('@outlook.com'), {
      message: 'Please use Gmail, Yahoo, or Outlook email'
    }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and numbers'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type SignupFormData = z.infer<typeof signupSchema>;