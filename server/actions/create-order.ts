"use server"

import { createOrderSchema } from "@/types/order-schema"
import { createSafeActionClient } from "next-safe-action"
import { auth } from "../auth"
import { db } from "@/server"
import { orderProduct, orders } from "../schema"
import { eq } from "drizzle-orm"
import Stripe from "stripe"
import { calculateCartTotal } from "./create-payment-intent"

const action = createSafeActionClient()

function getStripe() {
  const stripeSecret = process.env.STRIPE_SECRET
  if (!stripeSecret) throw new Error("STRIPE_SECRET is required")
  return new Stripe(stripeSecret)
}

export const createOrder = action(
  createOrderSchema,
  async ({ products, paymentIntentID }) => {
    const user = await auth()
    if (!user) return { error: "user not found" }

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.paymentIntentID, paymentIntentID),
    })
    if (existingOrder) return { success: "Order has already been added" }

    const total = await calculateCartTotal(products)
    if (!total) return { error: "Invalid cart" }

    const paymentIntent = await getStripe().paymentIntents.retrieve(
      paymentIntentID,
      { expand: ["latest_charge"] }
    )
    if (paymentIntent.status !== "succeeded") {
      return { error: "Payment has not succeeded" }
    }

    const charge =
      typeof paymentIntent.latest_charge === "string"
        ? null
        : paymentIntent.latest_charge

    await db.transaction(async (tx) => {
      const order = await tx
        .insert(orders)
        .values({
          status: paymentIntent.status,
          paymentIntentID,
          total,
          userID: user.user.id,
          receiptURL: charge?.receipt_url,
        })
        .returning()

      await Promise.all(
        products.map(({ productID, quantity, variantID }) =>
          tx.insert(orderProduct).values({
          quantity,
          orderID: order[0].id,
            productID,
          productVariantID: variantID,
          })
        )
      )
    })

    return { success: "Order has been added" }
  }
)
