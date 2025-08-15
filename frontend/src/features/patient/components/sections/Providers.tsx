"use client"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

export const Providers = () => {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="relative flex justify-center">
            <img
              src="/placeholder.svg?height=500&width=600&text=Healthcare+Providers"
              alt="Healthcare providers illustration"
              className="w-full max-w-lg h-auto"
            />
          </div>
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-gray-900 lg:text-5xl leading-tight">{t("providers.title")}</h2>
            <div className="w-16 h-1 bg-black"></div>
            <p className="text-gray-600 text-lg leading-relaxed">{t("providers.description")}</p>
            <Button
              variant="outline"
              size="lg"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-full text-lg bg-transparent"
            >
              {t("common.learnMore")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
