"use client"
import { Search, Pill, MessageSquare, FileText, Phone, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

const services = [
  {
    icon: Search,
    title: "services.searchDoctor.title",
    description: "services.searchDoctor.description",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    icon: Pill,
    title: "services.onlinePharmacy.title",
    description: "services.onlinePharmacy.description",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: MessageSquare,
    title: "services.consultation.title",
    description: "services.consultation.description",
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    icon: FileText,
    title: "services.detailsInfo.title",
    description: "services.detailsInfo.description",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    icon: Phone,
    title: "services.emergencyCare.title",
    description: "services.emergencyCare.description",
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
  },
  {
    icon: Activity,
    title: "services.tracking.title",
    description: "services.tracking.description",
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600",
  },
]

export const Services = () => {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t("services.title")}</h2>
          <div className="w-16 h-1 bg-black mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">{t("services.description")}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {services.map((service, index) => (
            <Card
              key={index}
              className="text-left border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl p-6"
            >
              <CardHeader className="pb-4">
                <div className={`w-20 h-20 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                  <service.icon className={`w-10 h-10 ${service.iconColor}`} />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-3">{t(service.title)}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {t(service.description)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-full text-lg bg-transparent"
          >
            {t("common.learnMore")}
          </Button>
        </div>
      </div>
    </section>
  )
}
