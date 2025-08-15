"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// Wrapper component để sử dụng hook
const ErrorBoundaryContent: React.FC<{ error: Error | null }> = ({ error }) => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen flex items-center justify-center font-outfit bg-gray-50">
      <div className="text-center">
        <h2 className="text-title-md font-bold text-gray-900 mb-4">{t("messages.errorOccurred")}</h2>
        <p className="text-theme-sm text-gray-600 mb-4">{error?.message || t("messages.errorMessage")}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-warning-500 text-white py-2 px-4 rounded-lg font-bold transition-all duration-300 button-hover hover:bg-warning-600"
        >
          {t("messages.reloadPage")}
        </button>
      </div>
    </div>
  )
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBoundaryContent error={this.state.error} />
    }

    return this.props.children
  }
}

export default ErrorBoundary
