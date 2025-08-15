"use client"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

export const Hero = () => {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight text-gray-900 lg:text-6xl">
                {t("hero.title")}
                <br />
                <span className="text-gray-900">{t("hero.subtitle")}</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">{t("hero.description")}</p>
            </div>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full">
              {t("hero.consultButton")}
            </Button>
          </div>
          <div className="relative flex justify-center">
            <img
              src="/placeholder.svg?height=600&width=800&text=Healthcare+Illustration"
              alt="Healthcare illustration"
              className="w-full max-w-2xl h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
