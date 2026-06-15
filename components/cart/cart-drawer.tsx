"use client"

import { useCartStore } from "@/lib/client-store"
import { ShoppingBag } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
} from "../ui/drawer"
import { AnimatePresence, motion } from "framer-motion"
import CartItems from "./cart-items"
import CartMessage from "./cart-message"
import Payment from "./payment"
import OrderConfirmed from "./order-confirmed"
import CartProgress from "./cart-progress"
import { useEffect } from "react"

type CartDrawerProps = {
  isAuthenticated: boolean
}

export default function CartDrawer({ isAuthenticated }: CartDrawerProps) {
  const {
    cart,
    checkoutProgress,
    setCheckoutProgress,
    cartOpen,
    setCartOpen,
  } = useCartStore()
  const visibleCart = isAuthenticated ? cart : []

  useEffect(() => {
    if (isAuthenticated) return

    if (checkoutProgress !== "cart-page") {
      setCheckoutProgress("cart-page")
    }
  }, [checkoutProgress, isAuthenticated, setCheckoutProgress])

  return (
    <Drawer open={cartOpen} onOpenChange={setCartOpen}>
      <button
        type="button"
        aria-label="Open cart"
        className="relative px-2"
        onClick={() => setCartOpen(true)}
        onPointerDown={() => setCartOpen(true)}
      >
        <AnimatePresence>
          {visibleCart.length > 0 && (
            <motion.span
              animate={{ scale: 1, opacity: 1 }}
              initial={{ opacity: 0, scale: 0 }}
              exit={{ scale: 0 }}
              className="absolute flex items-center justify-center -top-1 -right-0.5 w-4 h-4 dark:bg-primary bg-primary text-white text-xs font-bold rounded-full"
            >
              {visibleCart.length}
            </motion.span>
          )}
        </AnimatePresence>
        <ShoppingBag />
      </button>
      <DrawerContent className="fixed bottom-0 left-0 max-h-[70vh] min-h-[50vh]">
        <DrawerHeader>
          <CartMessage />
        </DrawerHeader>
        <CartProgress />
        <div className="overflow-auto p-4">
          {checkoutProgress === "cart-page" && (
            <CartItems isAuthenticated={isAuthenticated} />
          )}
          {checkoutProgress === "payment-page" && isAuthenticated && (
            <Payment />
          )}
          {checkoutProgress === "confirmation-page" && <OrderConfirmed />}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
