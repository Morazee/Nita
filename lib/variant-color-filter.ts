import type { VariantsWithProduct } from "@/lib/infer-type"

type VariantForColorFilter = Pick<
  VariantsWithProduct,
  "color" | "productType" | "variantTags"
>

export type VariantColorFilter = {
  slug: string
  label: string
  color: string
}

const KNOWN_COLOR_NAMES = [
  "amber",
  "aqua",
  "beige",
  "black",
  "blue",
  "brown",
  "coral",
  "cream",
  "cyan",
  "gold",
  "gray",
  "green",
  "grey",
  "indigo",
  "ivory",
  "lavender",
  "lime",
  "magenta",
  "maroon",
  "mint",
  "navy",
  "olive",
  "orange",
  "pink",
  "purple",
  "red",
  "rose",
  "silver",
  "teal",
  "violet",
  "white",
  "yellow",
]

const COLOR_PREFIXES = [...KNOWN_COLOR_NAMES].sort(
  (first, second) => second.length - first.length
)

export function normalizeVariantFilter(value?: string | null) {
  return (value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatFilterLabel(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function getColorNameFromProductType(productType: string) {
  const normalizedType = productType.trim().toLowerCase()
  const firstToken = normalizedType.match(/[a-z0-9]+/)?.[0] || ""
  const compactType = normalizedType.replace(/[^a-z0-9]/g, "")

  const prefixedColor = COLOR_PREFIXES.find((color) =>
    compactType.startsWith(color)
  )

  return prefixedColor || firstToken
}

function getColorNameFromTags(variant: VariantForColorFilter) {
  return variant.variantTags
    .map((tag) => normalizeVariantFilter(tag.tag))
    .find((tag) => KNOWN_COLOR_NAMES.includes(tag))
}

export function getVariantColorSlug(variant: VariantForColorFilter) {
  return normalizeVariantFilter(
    getColorNameFromProductType(variant.productType) ||
      getColorNameFromTags(variant)
  )
}

export function variantMatchesColorFilter(
  variant: VariantForColorFilter,
  filter?: string | null
) {
  const normalizedFilter = normalizeVariantFilter(filter)

  if (!normalizedFilter) return true

  return (
    getVariantColorSlug(variant) === normalizedFilter ||
    variant.variantTags.some(
      (tag) => normalizeVariantFilter(tag.tag) === normalizedFilter
    )
  )
}

export function getVariantColorFilters(variants: VariantForColorFilter[]) {
  const filters = new Map<string, VariantColorFilter>()

  variants.forEach((variant) => {
    const slug = getVariantColorSlug(variant)
    if (!slug || filters.has(slug)) return

    filters.set(slug, {
      slug,
      label: formatFilterLabel(slug),
      color: isHexColor(variant.color) ? variant.color : "#000000",
    })
  })

  return [...filters.values()].sort((first, second) =>
    first.label.localeCompare(second.label)
  )
}

export function getReadableTextColor(background: string) {
  if (!isHexColor(background)) return "#ffffff"

  const hex = background.replace("#", "")
  const fullHex =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : hex

  const red = parseInt(fullHex.slice(0, 2), 16)
  const green = parseInt(fullHex.slice(2, 4), 16)
  const blue = parseInt(fullHex.slice(4, 6), 16)
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000

  return luminance > 155 ? "#111827" : "#ffffff"
}

function isHexColor(color: string) {
  return /^#(?:[0-9a-f]{3}){1,2}$/i.test(color)
}
