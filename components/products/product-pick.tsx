"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
export default function ProductPick({
  id,
  color,
  productType,
  selected,
}: {
  id: number
  color: string
  productType: string
  selected: boolean
}) {
  const router = useRouter()
  return (
    <div
      style={{ background: color }}
      aria-label={`Select ${productType}`}
      title={productType}
      className={cn(
        "w-8 h-8 rounded-full cursor-pointer transition-all duration-300 ease-in-out hober: opacity-75",
        selected ? "opacity-100 ring-2 ring-primary ring-offset-2" : "opacity-50"
      )}
      onClick={() => router.push(`/products/${id}`, { scroll: false })}
    ></div>
  )
}
