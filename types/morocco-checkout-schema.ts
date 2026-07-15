import * as z from "zod"

export const checkoutProductSchema = z.object({
  productID: z.number().int().positive(),
  variantID: z.number().int().positive(),
  quantity: z.number().int().positive(),
})

export const moroccoCheckoutSchema = z.object({
  products: z.array(checkoutProductSchema).min(1),
  customer: z.object({
    fullName: z.string().min(2).max(120),
    phone: z.string().min(8).max(30),
    address: z.string().min(5).max(300),
    city: z.string().min(2).max(100),
    postalCode: z.string().max(20).optional().default(""),
  }),
})
