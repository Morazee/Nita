"use client"

import { useEffect, useRef } from "react"
import { useCartStore } from "@/lib/client-store"
import { readUserCart, saveUserCart } from "@/lib/cart-storage"

type CartSessionSyncProps = {
  userId?: string
}

export default function CartSessionSync({ userId }: CartSessionSyncProps) {
  const {
    cart,
    setCart,
    setCartOpen,
    setCheckoutProgress,
  } = useCartStore()
  const cartRef = useRef(cart)
  const activeUserId = useRef<string | null>(null)
  const loadedUserId = useRef<string | null>(null)
  const skipNextPersist = useRef(false)

  useEffect(() => {
    cartRef.current = cart
  }, [cart])

  useEffect(() => {
    const previousUserId = activeUserId.current

    if (previousUserId && previousUserId !== userId) {
      saveUserCart(previousUserId, cartRef.current)
    }

    if (!userId) {
      activeUserId.current = null
      loadedUserId.current = null
      skipNextPersist.current = true
      setCart([])
      setCartOpen(false)
      setCheckoutProgress("cart-page")
      return
    }

    const storedCart = readUserCart(userId)
    const nextCart = storedCart ?? cartRef.current

    activeUserId.current = userId
    loadedUserId.current = userId
    skipNextPersist.current = true
    setCart(nextCart)
    setCheckoutProgress("cart-page")

    if (storedCart === null && nextCart.length > 0) {
      saveUserCart(userId, nextCart)
    }
  }, [setCart, setCartOpen, setCheckoutProgress, userId])

  useEffect(() => {
    if (!userId || loadedUserId.current !== userId) return

    if (skipNextPersist.current) {
      skipNextPersist.current = false
      return
    }

    saveUserCart(userId, cart)
  }, [cart, userId])

  return null
}
