"use client"

import { cn } from "@/lib/utils"
import {
  getReadableTextColor,
  normalizeVariantFilter,
  VariantColorFilter,
} from "@/lib/variant-color-filter"
import { Badge } from "../ui/badge"
import { useRouter, useSearchParams } from "next/navigation"

type ProductTagsProps = {
  filters: VariantColorFilter[]
}

export default function ProductTags({ filters }: ProductTagsProps) {
  const router = useRouter()
  const params = useSearchParams()
  const tag = normalizeVariantFilter(params.get("tag"))

  const setFilter = (tag: string) => {
    if (tag) {
      router.push(`/?tag=${encodeURIComponent(tag)}`)
    }
    if (!tag) {
      router.push("/")
    }
  }

  return (
    <div className="my-4 flex flex-wrap gap-4 items-center justify-center">
      <Badge
        onClick={() => setFilter("")}
        className={cn(
          "cursor-pointer bg-black hover:bg-black/75 hover:opacity-100",
          !tag ? "opacity-100" : "opacity-50"
        )}
      >
        All
      </Badge>
      {filters.map((filter) => (
        <Badge
          key={filter.slug}
          onClick={() => setFilter(filter.slug)}
          className={cn(
            "cursor-pointer border-border hover:opacity-100",
            tag === filter.slug ? "opacity-100" : "opacity-50"
          )}
          style={{
            backgroundColor: filter.color,
            color: getReadableTextColor(filter.color),
          }}
        >
          {filter.label}
        </Badge>
      ))}
    </div>
  )
}
