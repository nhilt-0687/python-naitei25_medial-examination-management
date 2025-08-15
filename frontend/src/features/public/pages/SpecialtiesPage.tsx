"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { departmentService } from "../../../shared/services/departmentService";

interface Department {
  id: number;
  department_name: string;
  description?: string;
}

const SpecialtiesPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const data = await departmentService.getDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách khoa:", error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="h-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <section className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 text-white mb-12">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Chuyên khoa</h1>
          <p className="text-lg text-teal-100 mb-6">
            Khám phá các chuyên khoa và lựa chọn phù hợp với nhu cầu của bạn
          </p>
        </div>
      </section>

      {/* Specialties Grid */}
      <div className="container mx-auto px-4 pb-20">
        {departments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept) => (
              <Card
                key={dept.id}
                className="group hover:shadow-xl transition-all border-0 overflow-hidden h-full flex flex-col"
              >
                <CardHeader className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {dept.department_name}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 flex flex-col flex-grow">
                  <p className="text-gray-600 text-sm mb-6 line-clamp-3 min-h-[60px]">
                    {dept.description || "Chưa có mô tả"}
                  </p>
                  <div className="mt-auto">
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 group-hover:shadow-lg transition-all"
                      onClick={() => navigate(`/doctors?department=${dept.id}`)}
                    >
                      Xem bác sĩ
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            Không tìm thấy chuyên khoa
          </p>
        )}
      </div>
    </div>
  );
};

export default SpecialtiesPage;
