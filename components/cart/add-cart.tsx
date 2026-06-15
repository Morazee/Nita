"use client"

import { useCartStore } from "@/lib/client-store"
import { useState } from "react"
import { Button } from "../ui/button"
import { Minus, Plus } from "lucide-react"
import { toast } from "sonner"

type AddCartProps = {
  productID: number
  variantID: number
  title: string
  productType: string
  price: number
  image: string
}

export default function AddCart({
  productID,
  variantID,
  title,
  productType,
  price,
  image,
}: AddCartProps) {
  const { addToCart } = useCartStore()
  const [quantity, setQuantity] = useState(1)
  const itemName = `${title} ${productType}`

  return (
    <>
      <div className="flex items-center gap-4 justify-stretch my-4">
        <Button
          onClick={() => {
            if (quantity > 1) {
              setQuantity(quantity - 1)
            }
          }}
          variant={"secondary"}
          className="text-primary"
        >
          <Minus size={18} strokeWidth={3} />
        </Button>
        <Button variant={"secondary"} className="flex-1">
          Quantity: {quantity}
        </Button>
        <Button
          onClick={() => {
            setQuantity(quantity + 1)
          }}
          variant={"secondary"}
          className="text-primary"
        >
          <Plus size={18} strokeWidth={3} />
        </Button>
      </div>
      <Button
        onClick={() => {
          toast.success(`Added ${itemName} to your cart!`)
          addToCart({
            id: productID,
            variant: { variantID, quantity },
            name: itemName,
            price,
            image,
          })
        }}
      >
        Add to cart
      </Button>
    </>
  )
}
