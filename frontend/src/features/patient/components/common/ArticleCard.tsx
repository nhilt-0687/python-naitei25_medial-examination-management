"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

interface ArticleCardProps {
  image: string
  title: string
  description: string
  date: string
}

export const ArticleCard = ({ image, title, description, date }: ArticleCardProps) => {
  const { t } = useTranslation()

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-2xl border-0 shadow-lg">
      <CardHeader className="p-0">
        <img src={image || "/placeholder.svg"} alt={title} className="w-full h-56 object-cover" />
      </CardHeader>
      <CardContent className="p-8">
        <h3 className="font-bold text-xl text-gray-900 mb-4 leading-tight line-clamp-2">{title}</h3>
        <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 font-medium">{date}</span>
          <Button variant="link" className="p-0 h-auto text-blue-600 font-semibold">
            {t("common.readMore")} →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
