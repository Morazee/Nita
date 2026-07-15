"use client"

import { useCartStore } from "@/lib/client-store"
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { Button } from "../ui/button"
import { useState } from "react"
import { createPaymentIntent } from "@/server/actions/create-payment-intent"
import { useAction } from "next-safe-action/hooks"
import { createOrder } from "@/server/actions/create-order"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function PaymentForm({ totalPrice: _totalPrice }: { totalPrice: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const { cart, setCheckoutProgress, clearCart, setCartOpen } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const router = useRouter()
  const { execute } = useAction(createOrder, {
    onSuccess: (data) => {
      if (data.data?.error) toast.error(data.data.error)
      if (data.data?.success) {
        setIsLoading(false)
        toast.success(data.data.success)
        setCheckoutProgress("confirmation-page")
        clearCart()
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    if (!stripe || !elements) {
      setIsLoading(false)
      return
    }
    const { error: submitError } = await elements.submit()
    if (submitError) {
      setErrorMessage(submitError.message || "Payment form error")
      setIsLoading(false)
      return
    }
    const { data } = await createPaymentIntent({
      currency: "usd",
      cart: cart.map((item) => ({ quantity: item.variant.quantity, productID: item.id, variantID: item.variant.variantID })),
    })
    if (data?.error) {
      setErrorMessage(data.error)
      setIsLoading(false)
      router.push("/auth/login")
      setCartOpen(false)
      return
    }
    if (data?.success) {
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: data.success.clientSecretID!,
        redirect: "if_required",
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          receipt_email: data.success.user as string,
        },
      })
      if (error) {
        setErrorMessage(error.message || "Payment failed")
        setIsLoading(false)
        return
      }
      execute({
        paymentIntentID: data.success.paymentIntentID,
        products: cart.map((item) => ({ productID: item.id, variantID: item.variant.variantID, quantity: item.variant.quantity })),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <AddressElement options={{ mode: "shipping" }} />
      {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
      <Button className="my-4 w-full" disabled={!stripe || !elements || isLoading}>
        {isLoading ? "Processing..." : "Pay now"}
      </Button>
    </form>
  )
}
