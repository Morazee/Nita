"use server"

import { createHmac } from "crypto"
import { createId } from "@paralleldrive/cuid2"
import { createSafeActionClient } from "next-safe-action"
import { auth } from "../auth"
import { db } from "@/server"
import { orderProduct, orders } from "../schema"
import { calculateCartTotal } from "./create-payment-intent"
import { moroccoCheckoutSchema } from "@/types/morocco-checkout-schema"

const action = createSafeActionClient()

export const createPayzoneCheckout = action(
  moroccoCheckoutSchema,
  async ({ products, customer }) => {
    const user = await auth()
    if (!user?.user?.id || !user.user.email) {
      return { error: "Please login to continue" }
    }

    const checkoutUrl = process.env.PAYZONE_CHECKOUT_URL
    const merchantId = process.env.PAYZONE_MERCHANT_ID
    const secret = process.env.PAYZONE_SECRET
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!checkoutUrl || !merchantId || !secret || !appUrl) {
      return { error: "Payzone is not configured yet" }
    }

    const total = await calculateCartTotal(products)
    if (!total) return { error: "Invalid cart" }

    const orderReference = `payzone_${createId()}`
    const amount = Math.round(total * 100).toString()
    const currency = "MAD"
    const returnUrl = `${appUrl}/payment/payzone/return?reference=${orderReference}`
    const callbackUrl = `${appUrl}/api/payzone/callback`
    const signaturePayload = [merchantId, orderReference, amount, currency, returnUrl, callbackUrl].join("|")
    const signature = createHmac("sha256", secret).update(signaturePayload).digest("hex")

    await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
          status: "pending_payzone",
          paymentIntentID: orderReference,
          total,
          userID: user.user.id,
          receiptURL: `payzone:${JSON.stringify(customer)}`,
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

    const url = new URL(checkoutUrl)
    url.searchParams.set("merchantId", merchantId)
    url.searchParams.set("orderReference", orderReference)
    url.searchParams.set("amount", amount)
    url.searchParams.set("currency", currency)
    url.searchParams.set("returnUrl", returnUrl)
    url.searchParams.set("callbackUrl", callbackUrl)
    url.searchParams.set("customerEmail", user.user.email)
    url.searchParams.set("customerName", customer.fullName)
    url.searchParams.set("customerPhone", customer.phone)
    url.searchParams.set("signature", signature)

    return { success: { checkoutUrl: url.toString(), orderReference } }
  }
)
