"use client"

import { Award, Users, Heart, Shield, Clock, Star, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function AboutPage() {
  const navigate = useNavigate()

  const stats = [
    { icon: Users, number: "500+", label: "Bác sĩ chuyên khoa", color: "text-teal-600" },
    { icon: Heart, number: "50,000+", label: "Bệnh nhân tin tưởng", color: "text-red-500" },
    { icon: Award, number: "25+", label: "Chuyên khoa", color: "text-green-600" },
    { icon: Star, number: "4.8/5", label: "Đánh giá trung bình", color: "text-yellow-500" },
  ]

  const values = [
    {
      icon: Heart,
      title: "Tận tâm",
      description: "Chúng tôi luôn đặt sức khỏe và sự hài lòng của bệnh nhân lên hàng đầu",
    },
    {
      icon: Shield,
      title: "An toàn",
      description: "Tuân thủ nghiêm ngặt các tiêu chuẩn y tế quốc tế và bảo mật thông tin",
    },
    {
      icon: Award,
      title: "Chuyên nghiệp",
      description: "Đội ngũ bác sĩ giàu kinh nghiệm với trình độ chuyên môn cao",
    },
    {
      icon: Clock,
      title: "Tiện lợi",
      description: "Dịch vụ 24/7 với hệ thống đặt lịch trực tuyến hiện đại",
    },
  ]

  const milestones = [
    { year: "2020", title: "Thành lập", description: "Ra mắt với 50 bác sĩ đầu tiên" },
    { year: "2021", title: "Mở rộng", description: "Phát triển lên 200+ bác sĩ, 15 chuyên khoa" },
    { year: "2022", title: "Công nghệ", description: "Ứng dụng AI trong chẩn đoán và tư vấn" },
    { year: "2023", title: "Quốc tế", description: "Hợp tác với các bệnh viện hàng đầu thế giới" },
    { year: "2024", title: "Hiện tại", description: "500+ bác sĩ, 50,000+ bệnh nhân tin tưởng" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white mb-12">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Về HealthCare</h1>
          <p className="text-lg text-teal-100 mb-6">
            Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất với đội ngũ bác sĩ chuyên nghiệp và công nghệ y tế hiện đại nhất.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-gray-100 transition-colors mb-4 ${stat.color}`}
                >
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Sứ mệnh của chúng tôi</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                HealthCare được thành lập với sứ mệnh democratize healthcare - làm cho dịch vụ chăm sóc sức khỏe chất
                lượng cao trở nên dễ tiếp cận hơn với mọi người.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Tầm nhìn 2030</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Trở thành nền tảng y tế số 1 Việt Nam</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Phục vụ 1 triệu bệnh nhân mỗi năm</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Mở rộng ra toàn khu vực Đông Nam Á</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">Tích hợp AI và IoT trong chăm sóc sức khỏe</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-4">Cam kết chất lượng</h4>
                  <p className="text-gray-600">
                    Chúng tôi không ngừng nâng cao chất lượng dịch vụ và đầu tư vào công nghệ để mang lại trải nghiệm
                    tốt nhất cho bệnh nhân.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Giá trị cốt lõi</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những giá trị này định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white mb-6">
                  <value.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Hành trình phát triển</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Từ những ngày đầu khởi nghiệp đến hiện tại</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-teal-200"></div>

              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex items-center mb-12 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <Card className="p-6 shadow-lg border-0">
                      <div className="text-2xl font-bold text-teal-600 mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </Card>
                  </div>

                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-teal-600 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Tham gia cùng chúng tôi</h2>
            <p className="text-lg mb-10 text-teal-100">
              Hãy trở thành một phần của cộng đồng HealthCare và cùng chúng tôi xây dựng tương lai chăm sóc sức khỏe tốt
              hơn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100 shadow-lg"
                onClick={() => navigate("/auth/register")}
              >
                Đăng ký ngay
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-teal-600 bg-transparent"
                onClick={() => navigate("/contact")}
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
