"use server"

import { auth } from "../auth"

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Admin access required" as const }
  }
  return { success: true as const }
}
