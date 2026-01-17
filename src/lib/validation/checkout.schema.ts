import { z } from 'zod';

export const checkoutSchema = z.object({
  // Shipping Information
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(4, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),

  // Payment Information
  paymentMethod: z.enum(['credit_card', 'paypal', 'cash_on_delivery']),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
