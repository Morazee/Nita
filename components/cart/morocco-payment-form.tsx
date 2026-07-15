"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { useCartStore } from "@/lib/client-store"
import { createCodOrder } from "@/server/actions/create-cod-order"
import { createPayzoneCheckout } from "@/server/actions/create-payzone-checkout"
import { Button } from "../ui/button"

type Method = "cod" | "payzone"

export default function MoroccoPaymentForm({ method }: { method: Method }) {
  const { cart, clearCart, setCheckoutProgress } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [customer, setCustomer] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  })

  const products = cart.map((item) => ({
    productID: item.id,
    variantID: item.variant.variantID,
    quantity: item.variant.quantity,
  }))

  const codAction = useAction(createCodOrder, {
    onSuccess: ({ data }) => {
      setIsLoading(false)
      if (data?.error) return toast.error(data.error)
      if (data?.success) {
        toast.success(data.success)
        clearCart()
        setCheckoutProgress("confirmation-page")
      }
    },
    onError: () => {
      setIsLoading(false)
      toast.error("Unable to create the order")
    },
  })

  const payzoneAction = useAction(createPayzoneCheckout, {
    onSuccess: ({ data }) => {
      setIsLoading(false)
      if (data?.error) return toast.error(data.error)
      if (data?.success?.checkoutUrl) window.location.assign(data.success.checkoutUrl)
    },
    onError: () => {
      setIsLoading(false)
      toast.error("Unable to start Payzone checkout")
    },
  })

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    const payload = { products, customer }
    if (method === "cod") codAction.execute(payload)
    else payzoneAction.execute(payload)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="rounded-md border bg-background px-3 py-2" required placeholder="Full name" value={customer.fullName} onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })} />
        <input className="rounded-md border bg-background px-3 py-2" required placeholder="Phone number" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
      </div>
      <input className="w-full rounded-md border bg-background px-3 py-2" required placeholder="Delivery address" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
      <div className="grid gap-4 sm:grid-cols-2">
        <input className="rounded-md border bg-background px-3 py-2" required placeholder="City" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} />
        <input className="rounded-md border bg-background px-3 py-2" placeholder="Postal code" value={customer.postalCode} onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })} />
      </div>
      <Button className="w-full" disabled={isLoading || products.length === 0}>
        {isLoading ? "Processing..." : method === "cod" ? "Place cash-on-delivery order" : "Pay securely with Payzone"}
      </Button>
    </form>
  )
}
