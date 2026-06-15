import * as z from "zod"

export const paymentIntentSchema = z.object({
  currency: z.string(),
  cart: z.array(
    z.object({
      quantity: z.number(),
      productID: z.number(),
      variantID: z.number(),
    })
  ),
})
