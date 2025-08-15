import { LocalStorageKeys } from "../constants/storageKeys"

type LocalStorageKey = (typeof LocalStorageKeys)[keyof typeof LocalStorageKeys]

export const storage = {
  set<T>(key: LocalStorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  },

  get<T>(key: LocalStorageKey): T | null {
    try {
      const value = localStorage.getItem(key)
      return value ? (JSON.parse(value) as T) : null
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error)
      return null
    }
  },

  remove(key: LocalStorageKey): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  },

  clear(): void {
    try {
      const language = this.getRaw(LocalStorageKeys.LANGUAGE)
      const locale = this.getRaw(LocalStorageKeys.LOCALE)

      localStorage.clear()

      if (language) {
        this.setRaw(LocalStorageKeys.LANGUAGE, language)
      }
      if (locale) {
        this.setRaw(LocalStorageKeys.LOCALE, locale)
      }
    } catch (error) {
      console.error("Error clearing localStorage:", error)
    }
  },

  setRaw(key: LocalStorageKey, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error(`Error setting raw localStorage key "${key}":`, error)
    }
  },

  getRaw(key: LocalStorageKey): string | null {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error(`Error getting raw localStorage key "${key}":`, error)
      return null
    }
  },

  setLanguage(language: string): void {
    this.setRaw(LocalStorageKeys.LANGUAGE, language)
  },

  getLanguage(): string | null {
    return this.getRaw(LocalStorageKeys.LANGUAGE)
  },

  setLocale(locale: string): void {
    this.setRaw(LocalStorageKeys.LOCALE, locale)
  },

  getLocale(): string | null {
    return this.getRaw(LocalStorageKeys.LOCALE)
  },
}
