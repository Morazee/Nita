"use client"

import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table"
import { useCartStore } from "@/lib/client-store"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo } from "react"
import formatPrice from "@/lib/format-price"
import Image from "next/image"
import { MinusCircle, PlusCircle } from "lucide-react"
import emptyCart from "@/public/empty-box.json"
import { createId } from "@paralleldrive/cuid2"
import { Button } from "../ui/button"
import dynamic from "next/dynamic"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/product-image"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type CartItemsProps = {
  isAuthenticated: boolean
}

export default function CartItems({ isAuthenticated }: CartItemsProps) {
  const { cart, addToCart, removeFromCart, setCheckoutProgress, setCartOpen } =
    useCartStore()
  const pathname = usePathname()
  const router = useRouter()
  const visibleCart = isAuthenticated ? cart : []

  const totalPrice = useMemo(() => {
    if (!isAuthenticated) return 0

    return cart.reduce((acc, item) => {
      return acc + item.price! * item.variant.quantity
    }, 0)
  }, [cart, isAuthenticated])

  const priceInLetters = useMemo(() => {
    return [...totalPrice.toFixed(2).toString()].map((letter) => {
      return { letter, id: createId() }
    })
  }, [totalPrice])

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout")
      setCartOpen(false)
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    setCheckoutProgress("payment-page")
  }

  return (
    <motion.div className="flex flex-col items-center">
      {visibleCart.length === 0 && (
        <div className="flex-col w-full flex items-center justify-center">
          <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-2xl text-muted-foreground text-center">
              Your cart is empty
            </h2>
            <Lottie className="h-64" animationData={emptyCart} />
          </motion.div>
        </div>
      )}
      {visibleCart.length > 0 && (
        <div className="max-h-80 w-full  overflow-y-auto">
          <Table className="max-w-2xl mx-auto">
            <TableHeader>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleCart.map((item) => (
                <TableRow key={(item.id + item.variant.variantID).toString()}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{formatPrice(item.price)}</TableCell>
                  <TableCell>
                    <div>
                      <Image
                        className="rounded-md"
                        width={48}
                        height={48}
                        src={item.image || PRODUCT_IMAGE_FALLBACK}
                        alt={item.name}
                        priority
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-between ">
                      <MinusCircle
                        onClick={() => {
                          removeFromCart({
                            ...item,
                            variant: {
                              quantity: 1,
                              variantID: item.variant.variantID,
                            },
                          })
                        }}
                        className="cursor-pointer hover:text-muted-foreground duration-300 transition-colors"
                        size={14}
                      />
                      <p className="text-md font-bold">
                        {item.variant.quantity}
                      </p>
                      <PlusCircle
                        className="cursor-pointer hover:text-muted-foreground duration-300 transition-colors"
                        onClick={() => {
                          addToCart({
                            ...item,
                            variant: {
                              quantity: 1,
                              variantID: item.variant.variantID,
                            },
                          })
                        }}
                        size={14}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <motion.div className="flex items-center justify-center relative my-4 overflow-hidden">
        <span className="text-md">Total: $</span>
        <AnimatePresence mode="popLayout">
          {priceInLetters.map((letter, i) => (
            <motion.div key={letter.id}>
              <motion.span
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ delay: i * 0.1 }}
                className="text-md inline-block"
              >
                {letter.letter}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      <Button
        onClick={handleCheckout}
        className="max-w-md w-full"
        disabled={visibleCart.length === 0}
      >
        Checkout
      </Button>
    </motion.div>
  )
}
