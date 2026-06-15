import placeholder from "@/public/placeholder_small.jpg"

type VariantWithImages = {
  variantImages?: { url?: string | null }[] | null
}

export const PRODUCT_IMAGE_FALLBACK = placeholder.src

export function getVariantImage(variant?: VariantWithImages | null) {
  return variant?.variantImages?.find((image) => image.url)?.url || PRODUCT_IMAGE_FALLBACK
}
