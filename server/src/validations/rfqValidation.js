import { z } from 'zod';

// Rules for creating an RFQ
export const createRfqSchema = z.object({
  productName: z.string().trim().min(2, 'Product or service name is required'),
  description: z.string().trim().min(5, 'Requirement description must be at least 5 characters'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than zero'),
  deliveryLocation: z.string().trim().min(2, 'Delivery location is required'),
  deadline: z
    .string()
    .refine((dateString) => !isNaN(Date.parse(dateString)), {
      message: 'Please provide a valid deadline date',
    })
    .refine((dateString) => new Date(dateString) > new Date(), {
      message: 'Deadline must be a future date and time',
    }),
});

// Rules for updating an existing RFQ
export const updateRfqSchema = z.object({
  productName: z.string().trim().min(2, 'Product or service name is required').optional(),
  description: z.string().trim().min(5, 'Requirement description must be at least 5 characters').optional(),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be a whole number')
    .positive('Quantity must be greater than zero')
    .optional(),
  deliveryLocation: z.string().trim().min(2, 'Delivery location is required').optional(),
  deadline: z
    .string()
    .refine((dateString) => !isNaN(Date.parse(dateString)), {
      message: 'Please provide a valid deadline date',
    })
    .refine((dateString) => new Date(dateString) > new Date(), {
      message: 'Deadline must be a future date and time',
    })
    .optional(),
});

// Rules for changing RFQ status (OPEN or CLOSED)
export const updateRfqStatusSchema = z.object({
  status: z.enum(['OPEN', 'CLOSED'], {
    errorMap: () => ({ message: 'Status must be OPEN or CLOSED' }),
  }),
});
