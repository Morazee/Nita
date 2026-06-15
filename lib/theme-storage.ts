export const DEFAULT_THEME = "light"

export type StoredTheme = "light" | "dark"

export function getUserThemeStorageKey(userId: string) {
  return `nita-theme:${userId}`
}

export function normalizeTheme(theme?: string | null): StoredTheme {
  return theme === "dark" ? "dark" : DEFAULT_THEME
}
