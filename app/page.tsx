import Algolia from "@/components/products/algolia"
import ProductTags from "@/components/products/product-tags"
import Products from "@/components/products/products"
import { getVariantColorFilters } from "@/lib/variant-color-filter"
import { db } from "@/server"

export const revalidate = 60 * 60

export default async function Home() {
  const data = await db.query.productVariants.findMany({
    with: {
      variantImages: true,
      variantTags: true,
      product: true,
    },
    orderBy: (productVariants, { desc }) => [desc(productVariants.id)],
  })
  const colorFilters = getVariantColorFilters(data)

  return (
    <main className="">
      <Algolia />
      <ProductTags filters={colorFilters} />
      <Products variants={data} />
    </main>
  )
}
