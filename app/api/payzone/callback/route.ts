import { createHmac, timingSafeEqual } from "crypto"
import { NextResponse } from "next/server"
import { db } from "@/server"
import { orders } from "@/server/schema"
import { eq } from "drizzle-orm"

function validSignature(reference: string, status: string, amount: string, received: string) {
  const secret = process.env.PAYZONE_SECRET
  if (!secret || !received) return false
  const expected = createHmac("sha256", secret).update([reference, status, amount].join("|")).digest("hex")
  if (expected.length !== received.length) return false
  return timingSafeEqual(Buffer.from(expected), Buffer.from(received))
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || ""
  const body = contentType.includes("application/json")
    ? await request.json()
    : Object.fromEntries((await request.formData()).entries())

  const reference = String(body.orderReference || body.reference || "")
  const status = String(body.status || "")
  const amount = String(body.amount || "")
  const signature = String(body.signature || "")

  if (!reference || !validSignature(reference, status, amount, signature)) {
    return NextResponse.json({ error: "Invalid callback" }, { status: 400 })
  }

  const normalizedStatus = ["paid", "success", "succeeded", "approved"].includes(status.toLowerCase())
    ? "paid"
    : ["failed", "declined", "cancelled", "canceled"].includes(status.toLowerCase())
      ? "payment_failed"
      : "pending_payzone"

  await db.update(orders).set({ status: normalizedStatus }).where(eq(orders.paymentIntentID, reference))
  return NextResponse.json({ received: true })
}
