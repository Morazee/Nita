"use server"

import { createId } from "@paralleldrive/cuid2"
import { createSafeActionClient } from "next-safe-action"
import { auth } from "../auth"
import { db } from "@/server"
import { orderProduct, orders } from "../schema"
import { calculateCartTotal } from "./create-payment-intent"
import { moroccoCheckoutSchema } from "@/types/morocco-checkout-schema"

const action = createSafeActionClient()

export const createCodOrder = action(moroccoCheckoutSchema, async ({ products, customer }) => {
  const user = await auth()
  if (!user?.user?.id) return { error: "Please login to continue" }

  const total = await calculateCartTotal(products)
  if (!total) return { error: "Invalid cart" }

  const orderReference = `cod_${createId()}`
  const customerData = JSON.stringify(customer)

  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        status: "pending_cod_confirmation",
        paymentIntentID: orderReference,
        total,
        userID: user.user.id,
        receiptURL: `cod:${customerData}`,
      })
      .returning()

    await Promise.all(
      products.map(({ productID, quantity, variantID }) =>
        tx.insert(orderProduct).values({
          quantity,
          orderID: order.id,
          productID,
          productVariantID: variantID,
        })
      )
    )
  })

  return {
    success: "Cash-on-delivery order received",
    orderReference,
  }
})
