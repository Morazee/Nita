import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardHeader,
} from "@/components/ui/card"
import { db } from "@/server"

import Sales from "./sales"
import Earnings from "./earnings"
import { auth } from "@/server/auth"
import { redirect } from "next/navigation"

export const revalidate = 0

export default async function Analytics() {
  const session = await auth()
  if (session?.user.role !== "admin") redirect("/dashboard/orders")

  const totalOrders = await db.query.orderProduct.findMany({
    with: {
      order: { with: { user: true } },
      product: true,
      productVariants: { with: { variantImages: true } },
    },
  })

  if (totalOrders.length === 0)
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Orders</CardTitle>
        </CardHeader>
      </Card>
    )

  if (totalOrders)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Analytics</CardTitle>
          <CardDescription>
            Check your sales, new customers and more
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col lg:flex-row gap-8 ">
          <Sales totalOrders={totalOrders} />
          <Earnings totalOrders={totalOrders} />
        </CardContent>
      </Card>
    )
}
