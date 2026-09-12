import { z } from 'zod';

// Rules for registering a new user account
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['BUYER', 'SUPPLIER'], {
    errorMap: () => ({ message: 'Role must be either BUYER or SUPPLIER' }),
  }),
});

// Rules for logging in
export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
