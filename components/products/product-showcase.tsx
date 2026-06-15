"use client"

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { VariantsWithImagesTags } from "@/lib/infer-type"
import { useEffect, useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/product-image"

export default function ProductShowcase({
  variants,
  selectedVariantID,
}: {
  variants: VariantsWithImagesTags[]
  selectedVariantID: number
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [activeThumbnail, setActiveThumbnail] = useState([0])
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantID) || variants[0]
  const selectedImages: { url: string; name: string }[] = selectedVariant.variantImages
    .filter((image) => Boolean(image.url))
    .map((image) => ({
      url: image.url || PRODUCT_IMAGE_FALLBACK,
      name: image.name || selectedVariant.productType,
    }))

  if (selectedImages.length === 0) {
    selectedImages.push({
      url: PRODUCT_IMAGE_FALLBACK,
      name: selectedVariant.productType,
    })
  }

  const updatePreview = (index: number) => {
    api?.scrollTo(index)
  }

  useEffect(() => {
    if (!api) {
      return
    }

    api.on("slidesInView", (e) => {
      setActiveThumbnail(e.slidesInView())
    })
  }, [api])

  return (
    <Carousel setApi={setApi} opts={{ loop: true }}>
      <CarouselContent>
        {selectedImages.map((img, index) => (
          <CarouselItem key={`${img.url}-${index}`}>
            <Image
              priority
              className="rounded-md"
              width={1280}
              height={720}
              src={img.url}
              alt={img.name}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex overflow-clip py-2 gap-4">
        {selectedImages.map((img, index) => (
          <div key={`${img.url}-${index}`}>
            <Image
              onClick={() => updatePreview(index)}
              priority
              className={cn(
                index === activeThumbnail[0] ? "opacity-100" : "opacity-75",
                "rounded-md transition-all duration-300 ease-in-out cursor-pointer hover:opacity-75"
              )}
              width={72}
              height={48}
              src={img.url}
              alt={img.name}
            />
          </div>
        ))}
      </div>
    </Carousel>
  )
}
