"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: "Địa chỉ",
      details: ["123 Đường ABC, Quận 1", "TP. Hồ Chí Minh, Việt Nam"],
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      icon: Phone,
      title: "Điện thoại",
      details: ["+84 123 456 789", "Hotline: 1900 1234"],
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@healthcare.vn", "support@healthcare.vn"],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      details: ["Thứ 2 - Thứ 6: 8:00 - 20:00", "Thứ 7 - CN: 8:00 - 17:00"],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const services = [
    {
      icon: MessageCircle,
      title: "Tư vấn trực tuyến",
      description: "Nhận tư vấn từ bác sĩ qua video call hoặc chat",
      action: "Bắt đầu tư vấn",
    },
    {
      icon: Calendar,
      title: "Đặt lịch khám",
      description: "Đặt lịch khám với bác sĩ chuyên khoa phù hợp",
      action: "Đặt lịch ngay",
    },
    {
      icon: Users,
      title: "Hỗ trợ khách hàng",
      description: "Đội ngũ hỗ trợ 24/7 sẵn sàng giải đáp thắc mắc",
      action: "Liên hệ ngay",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white mb-12">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-lg text-teal-100 mb-6">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi bất cứ lúc nào.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${info.bgColor} mb-4`}>
                  <info.icon className={`h-8 w-8 ${info.color}`} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-600 text-sm">
                      {detail}
                    </p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Gửi tin nhắn</CardTitle>
                  <p className="text-gray-600">Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn sớm nhất</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Họ và tên</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Nhập họ và tên của bạn"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Số điện thoại</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="Nhập số điện thoại"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Nhập địa chỉ email"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Chủ đề</Label>
                      <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chủ đề" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="appointment">Đặt lịch khám</SelectItem>
                          <SelectItem value="consultation">Tư vấn y tế</SelectItem>
                          <SelectItem value="technical">Hỗ trợ kỹ thuật</SelectItem>
                          <SelectItem value="complaint">Khiếu nại</SelectItem>
                          <SelectItem value="other">Khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Tin nhắn</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Nhập nội dung tin nhắn..."
                        rows={5}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                      size="lg"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Gửi tin nhắn
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Services & Map */}
            <div className="space-y-8">
              {/* Quick Services */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Dịch vụ nhanh</CardTitle>
                  <p className="text-gray-600">Truy cập nhanh các dịch vụ phổ biến</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <service.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{service.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-teal-600 border-teal-600 hover:bg-teal-600 hover:text-white bg-transparent"
                          >
                            {service.action}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Vị trí</CardTitle>
                  <p className="text-gray-600">Tìm chúng tôi tại trung tâm thành phố</p>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Bản đồ sẽ được hiển thị tại đây</p>
                      <p className="text-sm text-gray-400">123 Đường ABC, Quận 1, TP.HCM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Câu hỏi thường gặp</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Một số câu hỏi phổ biến mà khách hàng thường quan tâm</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Làm thế nào để đặt lịch khám?",
                answer:
                  "Bạn có thể đặt lịch khám trực tuyến qua website hoặc ứng dụng di động của chúng tôi. Chỉ cần chọn bác sĩ, thời gian phù hợp và xác nhận đặt lịch.",
              },
              {
                question: "Chi phí khám bệnh như thế nào?",
                answer:
                  "Chi phí khám bệnh phụ thuộc vào chuyên khoa và bác sĩ. Bạn có thể xem chi tiết phí khám trên trang thông tin của từng bác sĩ.",
              },
              {
                question: "Có thể hủy lịch khám không?",
                answer:
                  "Có, bạn có thể hủy lịch khám trước 24 giờ mà không mất phí. Việc hủy muộn hơn có thể phát sinh chi phí.",
              },
              {
                question: "Có hỗ trợ bảo hiểm y tế không?",
                answer:
                  "Chúng tôi hỗ trợ thanh toán qua các loại bảo hiểm y tế phổ biến. Vui lòng liên hệ để biết thêm chi tiết.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Cần hỗ trợ khẩn cấp?</h2>
          <p className="text-lg text-teal-100 mb-8 max-w-2xl mx-auto">
            Đội ngũ hỗ trợ 24/7 của chúng tôi luôn sẵn sàng giúp đỡ bạn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
              <Phone className="mr-2 h-4 w-4" />
              Gọi ngay: 1900 1234
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-teal-600 bg-transparent"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat trực tuyến
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
