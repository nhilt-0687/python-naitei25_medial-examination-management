"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Star,
  Clock,
  Users,
  Award,
  TrendingUp,
  ChevronRight,
  Stethoscope,
  Heart,
  Shield,
  Phone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { doctorService } from "../../../shared/services/doctorService"
import { departmentService, DepartmentDetail } from "../../../shared/services/departmentService"
import { storage } from "../../../shared/utils/storage"
import { LocalStorageKeys } from "../../../shared/constants/storageKeys"

interface Doctor {
  id: number
  first_name: string
  last_name: string
  specialization: string
  avatar?: string
  price?: number
  department: {
    department_name: string
  }
}

interface Department {
  id: number
  department_name: string
  doctorCount: number
}

const HomePage: React.FC = () => {
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Department[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(!!storage.getRaw(LocalStorageKeys.AUTH_TOKEN)) // Vẫn giữ để hiển thị nút CTA
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Lấy danh sách departments
        const departments = await departmentService.getDepartments()
        
        // Lấy số lượng bác sĩ cho mỗi department
        const departmentsWithCount = await Promise.all(
          departments.map(async (dept) => {
            const doctors = await departmentService.getDoctorsByDepartmentId(dept.id)
            return {
              id: dept.id,
              department_name: dept.department_name,
              doctorCount: doctors.length
            }
          })
        )
        setSpecialties(departmentsWithCount)

        // Lấy danh sách bác sĩ
        const allDoctors = await doctorService.getAllDoctors()
        // Chọn 3 bác sĩ đầu tiên làm featured
        setFeaturedDoctors(allDoctors.slice(0, 3).map(doctor => ({
          id: doctor.id,
          first_name: doctor.first_name,
          last_name: doctor.last_name,
          specialization: doctor.specialization,
          avatar: doctor.avatar,
          price: doctor.price,
          department: {
            department_name: doctor.department.department_name
          }
        })))
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ backend:", error)
        // Không fallback mock data nữa, có thể hiển thị thông báo lỗi nếu muốn
        setFeaturedDoctors([])
        setSpecialties([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Bỏ isAuthenticated khỏi dependency vì API giờ công khai

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto mb-6"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-[500px] mx-auto mb-8"></div>
              <div className="h-14 bg-gray-200 rounded-lg w-[400px] mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 lg:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium">Chăm sóc sức khỏe hàng đầu</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Sức khỏe là
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {" "}hạnh phúc
              </span>
            </h1>
            <p className="text-lg md:text-xl text-teal-100 mb-10">
              Đặt lịch khám với các bác sĩ hàng đầu, dễ dàng và nhanh chóng
            </p>
            <div className="flex justify-center gap-4 max-w-xl mx-auto">
              <Input
                placeholder="Tìm bác sĩ, chuyên khoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/10 border-white/20 text-white placeholder:text-teal-200"
              />
              <Button
                onClick={handleSearch}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
              >
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Bác sĩ nổi bật</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Gặp gỡ đội ngũ bác sĩ giàu kinh nghiệm của chúng tôi
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDoctors.length > 0 ? (
              featuredDoctors.map((doctor) => (
                <Card key={doctor.id} className="group hover:shadow-xl transition-all border-0 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={doctor.avatar || "/placeholder-doctor.jpg"}
                      alt={`${doctor.first_name} ${doctor.last_name}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <Badge className="absolute top-4 right-4 bg-gradient-to-r from-teal-500 to-emerald-500">
                      {doctor.department.department_name}
                    </Badge>
                  </div>
                  <CardHeader className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900">
                      BS. {doctor.first_name} {doctor.last_name}
                    </h3>
                    <p className="text-teal-600 font-medium">{doctor.specialization}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Phí khám</span>
                        <span className="font-bold text-green-600">{doctor.price?.toLocaleString()}đ</span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 group-hover:shadow-lg transition-all"
                      onClick={() => console.log(`Booking doctor ${doctor.id}`)}
                    >
                      Đặt lịch khám
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-3">Không tìm thấy bác sĩ</p>
            )}
          </div>
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white bg-transparent"
              onClick={() => navigate("/doctors")}
            >
              Xem tất cả bác sĩ
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Chuyên khoa</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Khám phá các chuyên khoa hàng đầu với đội ngũ bác sĩ chuyên môn cao
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialties.length > 0 ? (
              specialties.map((specialty) => (
                <Card
                  key={specialty.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => navigate(`/doctors?department=${specialty.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{specialty.department_name}</h3>
                      <p className="text-sm text-gray-600">{specialty.doctorCount} bác sĩ</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-4">Không tìm thấy chuyên khoa</p>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tại sao chọn chúng tôi?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe tốt nhất với công nghệ hiện đại
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "An toàn & Bảo mật",
                description: "Thông tin cá nhân được bảo vệ tuyệt đối với công nghệ mã hóa tiên tiến",
              },
              {
                icon: Clock,
                title: "Đặt lịch 24/7",
                description: "Đặt lịch khám bất cứ lúc nào, bất cứ nơi đâu với hệ thống trực tuyến",
              },
              {
                icon: Phone,
                title: "Hỗ trợ tận tình",
                description: "Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ bạn mọi lúc mọi nơi",
              },
            ].map((feature, index) => (
              <Card key={index} className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Bắt đầu hành trình chăm sóc sức khỏe</h2>
            <p className="text-lg mb-10 text-teal-100">
              Đăng ký ngay hôm nay để trải nghiệm dịch vụ chăm sóc sức khỏe hiện đại và chuyên nghiệp
            </p>
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-teal-600 hover:bg-gray-100 shadow-lg"
                  onClick={() => navigate("/auth/login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-teal-600 bg-transparent"
                  onClick={() => navigate("/auth/register")}
                >
                  Đăng ký ngay
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100 shadow-lg"
                onClick={() => navigate("/patient/dashboard")}
              >
                Đi tới Dashboard
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage