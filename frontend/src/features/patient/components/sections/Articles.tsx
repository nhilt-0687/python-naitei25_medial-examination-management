"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

const articles = [
  {
    image: "/placeholder.svg?height=300&width=400&text=Medical+Lab",
    title: "Disease detection, check up in the laboratory",
    description: "In this case, the role of the health laboratory is very important to do a disease detection...",
    date: "25 June 2021",
  },
  {
    image: "/placeholder.svg?height=300&width=400&text=Herbal+Medicine",
    title: "Herbal medicines that are safe for consumption",
    description: "Herbal medicine is very widely used at this time because of its very good for your health...",
    date: "25 June 2021",
  },
  {
    image: "/placeholder.svg?height=300&width=400&text=Skincare",
    title: "Natural care for healthy facial skin",
    description: "A healthy lifestyle should start from now and also for your skin health. There are some...",
    date: "25 June 2021",
  },
]

export const Articles = () => {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t("articles.title")}</h2>
          <div className="w-16 h-1 bg-black mx-auto"></div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {articles.map((article, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-2xl border-0 shadow-lg"
            >
              <CardHeader className="p-0">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-56 object-cover"
                />
              </CardHeader>
              <CardContent className="p-8">
                <h3 className="font-bold text-xl text-gray-900 mb-4 leading-tight line-clamp-2">{article.title}</h3>
                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">{article.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 font-medium">{article.date}</span>
                  <Button variant="link" className="p-0 h-auto text-blue-600 font-semibold">
                    {t("common.readMore")} →
                  </Button>
                </div>
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
            {t("common.viewAll")}
          </Button>
        </div>
      </div>
    </section>
  )
}
