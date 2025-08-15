import { message } from "antd"
import i18n from "../../i18n"

export interface ApiError {
  message: string
  code?: string
  status?: number
  field?: string
}

export const getErrorMessage = (error: any): string => {
  const t = i18n.t

  if (error.response) {
    const status = error.response.status
    const data = error.response.data

    switch (status) {
      case 400:
        return data?.message || t("errors.badRequest")
      case 401:
        return data?.message || t("errors.unauthorized")
      case 403:
        return data?.message || t("errors.forbidden")
      case 404:
        return data?.message || t("errors.notFound")
      case 409:
        return data?.message || t("errors.conflict")
      case 422:
        return data?.message || t("errors.validationError")
      case 500:
        return data?.message || t("errors.server")
      default:
        return data?.message || t("errors.server")
    }
  }

  if (error.request) {
    return t("errors.network")
  }

  if (error.message) {
    const translatedMessage = t(`errors.${error.message}`, { defaultValue: null })
    return translatedMessage || error.message
  }

  return t("messages.errorMessage")
}

export const handleApiError = (error: any, showMessage = true): string => {
  const errorMessage = getErrorMessage(error)

  if (showMessage) {
    message.error(errorMessage)
  }

  console.error("API Error:", error)
  return errorMessage
}

export const showSuccessMessage = (key: string, params?: any): void => {
  const t = i18n.t
  const successMessage = t(key, params)
  message.success(successMessage)
}

export const showErrorMessage = (key: string, params?: any): void => {
  const t = i18n.t
  const errorMessage = t(key, params)
  message.error(errorMessage)
}

export const showLoadingMessage = (key = "api.loading"): void => {
  const t = i18n.t
  const loadingMessage = t(key)
  message.loading(loadingMessage)
}
