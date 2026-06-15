"use client"

import { VariantsWithImagesTags } from "@/lib/infer-type"
import { motion } from "framer-motion"

export default function ProductType({
  variants,
  selectedVariantID,
}: {
  variants: VariantsWithImagesTags[]
  selectedVariantID: number
}) {
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantID) || variants[0]

  return (
    <motion.div
      key={selectedVariant.id}
      animate={{ y: 0, opacity: 1 }}
      initial={{ opacity: 0, y: 6 }}
      className="text-secondary-foreground font-medium"
    >
      {selectedVariant.productType}
    </motion.div>
  )
}
