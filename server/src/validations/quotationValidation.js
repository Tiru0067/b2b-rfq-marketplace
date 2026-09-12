import { z } from 'zod';

// Rules for submitting a supplier quotation
export const createQuotationSchema = z.object({
  price: z
    .number({ invalid_type_error: 'Quoted price must be a number' })
    .positive('Quoted price must be greater than zero'),
  deliveryDays: z
    .number({ invalid_type_error: 'Estimated delivery time must be a number of days' })
    .int('Delivery days must be a whole number')
    .positive('Delivery days must be at least 1 day'),
  notes: z.string().trim().min(2, 'Please include a message or note with your quotation'),
});
