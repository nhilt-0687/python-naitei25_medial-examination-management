"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, ChevronRight, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { doctorService } from "../../../shared/services/doctorService";
import { departmentService } from "../../../shared/services/departmentService";
import { useAuth } from "../../../shared/context/AuthContext";

interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  specialization: string;
  avatar?: string;
  price?: number;
  department: {
    department_name: string;
  };
}

const DoctorsPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const departmentId = searchParams.get("department");
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        let fetchedDoctors: Doctor[] = [];

        if (departmentId) {
          const deptDoctors = await departmentService.getDoctorsByDepartmentId(
            Number(departmentId)
          );
          fetchedDoctors = deptDoctors;
        } else if (searchQuery) {
          const allDoctors = await doctorService.getAllDoctors();
          fetchedDoctors = allDoctors.filter(
            (doc) =>
              doc.first_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              doc.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              doc.specialization
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              doc.department.department_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          );
        } else {
          fetchedDoctors = await doctorService.getAllDoctors();
        }

        setDoctors(
          fetchedDoctors.map((doctor) => ({
            id: doctor.id,
            first_name: doctor.first_name,
            last_name: doctor.last_name,
            specialization: doctor.specialization,
            avatar: doctor.avatar,
            price: doctor.price,
            department: {
              department_name: doctor.department.department_name,
            },
          }))
        );
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu bác sĩ:", error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [departmentId, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-green-700 text-white mb-12">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Danh sách bác sĩ
          </h1>
          <p className="text-lg text-teal-100 mb-6">
            Tìm kiếm và đặt lịch hẹn với các bác sĩ hàng đầu
          </p>
          <div className="flex justify-center gap-4 max-w-xl mx-auto">
            <Input
              placeholder="Tìm bác sĩ..."
              defaultValue={searchQuery || ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(
                    `/doctors?search=${encodeURIComponent(
                      (e.target as HTMLInputElement).value
                    )}`
                  );
                }
              }}
              className="bg-white/10 border-white/20 text-white placeholder:text-teal-200"
            />
            <Button
              onClick={() =>
                navigate(
                  `/doctors?search=${encodeURIComponent(
                    (document.querySelector("input") as HTMLInputElement)
                      ?.value || ""
                  )}`
                )
              }
              className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
            >
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <div className="container mx-auto px-4 pb-20">
        {doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.map((doctor) => (
              <Card
                key={doctor.id}
                className="group hover:shadow-xl transition-all border-0 overflow-hidden"
              >
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
                  <p className="text-teal-600 font-medium">
                    {doctor.specialization}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Phí khám</span>
                      <span className="font-bold text-green-600">
                        {doctor.price?.toLocaleString()}đ
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 group-hover:shadow-lg transition-all"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate("/auth/patient-login");
                      } else {
                        navigate(`/patient/booking?doctorId=${doctor.id}`);
                      }
                    }}
                  >
                    Đặt lịch khám
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">Không tìm thấy bác sĩ</p>
        )}
      </div>
    </div>
  );
};

export default DoctorsPage;
