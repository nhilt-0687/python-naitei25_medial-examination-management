"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ServiceCardProps {
  icon: LucideIcon
  title: string
  description: string
  bgColor: string
  iconColor: string
}

export const ServiceCard = ({ icon: Icon, title, description, bgColor, iconColor }: ServiceCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="text-left border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white rounded-2xl p-6">
      <CardHeader className="pb-4">
        <div className={`w-20 h-20 ${bgColor} rounded-2xl flex items-center justify-center mb-6`}>
          <Icon className={`w-10 h-10 ${iconColor}`} />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 mb-3">{t(title)}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="text-gray-600 text-base leading-relaxed">{t(description)}</CardDescription>
      </CardContent>
    </Card>
  )
}
