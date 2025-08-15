"use client"

import { useEffect } from "react"
import { useTranslation } from "react-i18next"

export const useLanguage = () => {
  const { i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.lang = i18n.language

    const title = i18n.t("common.welcome") + " - Hospital Management System"
    document.title = title
  }, [i18n.language])

  return {
    language: i18n.language,
    changeLanguage: i18n.changeLanguage,
  }
}
