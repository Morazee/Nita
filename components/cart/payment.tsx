"use client"

import { useState } from "react"
import { useCartStore } from "@/lib/client-store"
import getStripe from "@/lib/get-stripe"
import { Elements } from "@stripe/react-stripe-js"
import { motion } from "framer-motion"
import PaymentForm from "./payment-form"
import MoroccoPaymentForm from "./morocco-payment-form"
import { useTheme } from "next-themes"
import { Button } from "../ui/button"

const stripe = getStripe()
type PaymentMethod = "stripe" | "payzone" | "cod"

export default function Payment() {
  const { cart } = useCartStore()
  const { theme } = useTheme()
  const [method, setMethod] = useState<PaymentMethod>("stripe")

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.variant.quantity, 0)

  return (
    <motion.div className="mx-auto max-w-2xl space-y-5">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button type="button" variant={method === "stripe" ? "default" : "outline"} onClick={() => setMethod("stripe")}>International card</Button>
        <Button type="button" variant={method === "payzone" ? "default" : "outline"} onClick={() => setMethod("payzone")}>Moroccan card</Button>
        <Button type="button" variant={method === "cod" ? "default" : "outline"} onClick={() => setMethod("cod")}>Cash on delivery</Button>
      </div>

      {method === "stripe" ? (
        <Elements
          stripe={stripe}
          options={{
            mode: "payment",
            currency: "usd",
            amount: Math.round(totalPrice * 100),
            appearance: { theme: theme === "dark" ? "night" : "flat" },
          }}
        >
          <PaymentForm totalPrice={totalPrice} />
        </Elements>
      ) : (
        <MoroccoPaymentForm method={method} />
      )}
    </motion.div>
  )
}
