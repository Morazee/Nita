"use server"

import { paymentIntentSchema } from "@/types/payment-intent-schema"
import { createSafeActionClient } from "next-safe-action"
import Stripe from "stripe"
import { auth } from "../auth"
import { db } from ".."
import { productVariants } from "../schema"
import { inArray } from "drizzle-orm"

const action = createSafeActionClient()

function getStripe() {
  const stripeSecret = process.env.STRIPE_SECRET
  if (!stripeSecret) throw new Error("STRIPE_SECRET is required")
  return new Stripe(stripeSecret)
}

type CheckoutProduct = {
  productID: number
  variantID: number
  quantity: number
}

export async function calculateCartTotal(products: CheckoutProduct[]) {
  if (products.length === 0) return null

  const variants = await db.query.productVariants.findMany({
    where: inArray(
      productVariants.id,
      products.map((product) => product.variantID)
    ),
    with: { product: true },
  })

  const variantsById = new Map(variants.map((variant) => [variant.id, variant]))
  let total = 0

  for (const item of products) {
    if (item.quantity < 1) return null
    const variant = variantsById.get(item.variantID)
    if (!variant || variant.productID !== item.productID) return null
    total += variant.product.price * item.quantity
  }

  return total
}

export const createPaymentIntent = action(
  paymentIntentSchema,
  async ({ cart, currency }) => {
    const user = await auth()
    if (!user) return { error: "Please login to continue" }
    const total = await calculateCartTotal(cart)
    if (!total) return { error: "No Product to checkout" }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(total * 100),
      currency,
      automatic_payment_methods: {
        enabled: true,
      },

      metadata: {
        cart: JSON.stringify(cart),
      },
    })
    return {
      success: {
        paymentIntentID: paymentIntent.id,
        clientSecretID: paymentIntent.client_secret,
        user: user.user.email,
      },
    }
  }
)
