import type { CartItem } from "@/lib/client-store"

export function getUserCartStorageKey(userId: string) {
  return `nita-cart:${userId}`
}

function normalizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return []

  return value.reduce<CartItem[]>((items, item) => {
    if (!item || typeof item !== "object") return items

    const cartItem = item as Partial<CartItem>
    const variant = cartItem.variant
    const id = Number(cartItem.id)
    const price = Number(cartItem.price)
    const variantID = Number(variant?.variantID)
    const quantity = Number(variant?.quantity)

    if (
      !Number.isFinite(id) ||
      !Number.isFinite(price) ||
      !Number.isFinite(variantID) ||
      !Number.isFinite(quantity)
    ) {
      return items
    }

    items.push({
      id,
      price,
      image: typeof cartItem.image === "string" ? cartItem.image : "",
      name: typeof cartItem.name === "string" ? cartItem.name : "",
      variant: {
        variantID,
        quantity: Math.max(1, Math.floor(quantity)),
      },
    })

    return items
  }, [])
}

export function readUserCart(userId: string) {
  const rawCart = window.localStorage.getItem(getUserCartStorageKey(userId))

  if (!rawCart) return null

  try {
    return normalizeCartItems(JSON.parse(rawCart))
  } catch {
    return []
  }
}

export function saveUserCart(userId: string, cart: CartItem[]) {
  window.localStorage.setItem(
    getUserCartStorageKey(userId),
    JSON.stringify(normalizeCartItems(cart))
  )
}
