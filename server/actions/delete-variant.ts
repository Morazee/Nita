"use server"
import { createSafeActionClient } from "next-safe-action"
import * as z from "zod"
import { db } from ".."
import { productVariants } from "../schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import algoliasearch from "algoliasearch"
import { requireAdmin } from "./admin"

const action = createSafeActionClient()

function getAlgoliaIndex() {
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_ID
  const adminKey = process.env.ALGOLIA_ADMIN
  if (!appId || !adminKey) throw new Error("Algolia credentials are required")
  return algoliasearch(appId, adminKey).initIndex("products")
}

export const deleteVariant = action(
  z.object({ id: z.number() }),
  async ({ id }) => {
    try {
      const admin = await requireAdmin()
      if ("error" in admin) return { error: admin.error }

      const deletedVariant = await db
        .delete(productVariants)
        .where(eq(productVariants.id, id))
        .returning()
      revalidatePath("dashboard/products")
      await getAlgoliaIndex().deleteObject(deletedVariant[0].id.toString())
      return { success: `Deleted ${deletedVariant[0].productType}` }
    } catch (error) {
      return { error: "Failed to delete variant" }
    }
  }
)
