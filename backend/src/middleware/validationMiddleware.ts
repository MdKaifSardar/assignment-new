import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const nameSchema = z.string()
  .min(20, { message: 'Name must be at least 20 characters long' })
  .max(60, { message: 'Name cannot exceed 60 characters' })
  .trim();

export const addressSchema = z.string()
  .max(400, { message: 'Address cannot exceed 400 characters' })
  .trim();

export const passwordSchema = z.string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(16, { message: 'Password cannot exceed 16 characters' })
  .refine((val) => /[A-Z]/.test(val), {
    message: 'Password must contain at least one uppercase letter',
  })
  .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
    message: 'Password must contain at least one special character',
  });

export const emailSchema = z.string()
  .email({ message: 'Invalid email address format' })
  .trim()
  .toLowerCase();

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
});

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'NORMAL_USER', 'STORE_OWNER']),
});

export const createStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().optional().nullable(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export const ratingSchema = z.object({
  storeId: z.string().min(1, 'Store ID is required'),
  value: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5'),
});

export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issue = error.errors[0];
        return res.status(400).json({
          error: issue ? issue.message : 'Validation failed',
          details: error.errors,
        });
      }
      return res.status(400).json({ error: 'Invalid request payload' });
    }
  };
};
