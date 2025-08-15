"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from "react-i18next"

export const Testimonials = () => {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-8">{t("testimonials.title")}</h2>
        </div>

        <Card className="max-w-4xl mx-auto shadow-2xl rounded-2xl">
          <CardContent className="p-12">
            <div className="flex items-start gap-8">
              <Avatar className="w-20 h-20 border-4 border-blue-100">
                <AvatarImage src="/placeholder.svg?height=80&width=80&text=User" />
                <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-600">EM</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Edward Newgate</h3>
                <p className="text-blue-600 mb-6 font-medium">Founder Circle</p>
                <p className="text-gray-700 leading-relaxed text-lg">
                  "Our dedicated patient engagement app and web portal allow you to access information instantaneously
                  (no tedious form, long calls, or administrative hassle) and securely"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-12 space-x-3">
          <div className="w-4 h-4 bg-white rounded-full"></div>
          <div className="w-4 h-4 bg-white/50 rounded-full"></div>
          <div className="w-4 h-4 bg-white/50 rounded-full"></div>
          <div className="w-4 h-4 bg-white/50 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
