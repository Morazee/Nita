"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import {
  DEFAULT_THEME,
  getUserThemeStorageKey,
  normalizeTheme,
} from "@/lib/theme-storage"

type ThemeSessionSyncProps = {
  userId?: string
}

export default function ThemeSessionSync({ userId }: ThemeSessionSyncProps) {
  const { setTheme } = useTheme()

  useEffect(() => {
    if (!userId) {
      setTheme(DEFAULT_THEME)
      return
    }

    const userThemeKey = getUserThemeStorageKey(userId)
    const storedTheme = window.localStorage.getItem(userThemeKey)
    const migratedTheme = storedTheme || window.localStorage.getItem("theme")
    const nextTheme = normalizeTheme(migratedTheme)

    window.localStorage.setItem(userThemeKey, nextTheme)
    setTheme(nextTheme)
  }, [setTheme, userId])

  return null
}
