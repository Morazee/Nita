import { db } from "@/server"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { getVariantImage } from "@/lib/product-image"
import { auth } from "@/server/auth"
import { redirect } from "next/navigation"

export default async function Products() {
  const session = await auth()
  if (session?.user.role !== "admin") redirect("/dashboard/orders")

  const products = await db.query.products.findMany({
    with: {
      productVariants: { with: { variantImages: true, variantTags: true } },
    },
    orderBy: (products, { desc }) => [desc(products.id)],
  })
  if (!products) throw new Error("No products found")

  const dataTable = products.map((product) => {
    if (product.productVariants.length === 0) {
      return {
        id: product.id,
        title: product.title,
        price: product.price,
        image: getVariantImage(),
        variants: [],
      }
    }
    const image = getVariantImage(product.productVariants[0])
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      variants: product.productVariants,
      image,
    }
  })
  if (!dataTable) throw new Error("No data found")
  return (
    <div>
      <DataTable columns={columns} data={dataTable} />
    </div>
  )
}
