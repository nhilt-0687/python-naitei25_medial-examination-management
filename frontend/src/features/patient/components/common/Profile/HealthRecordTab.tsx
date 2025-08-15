"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, X } from "lucide-react"
import { useToast } from "../../../hooks/useToast"
import { patientService } from "../../../../../shared/services/patientService"

interface HealthMetrics {
  id: number
  height: string
  weight: string
  blood_type: string
}

interface MedicalHistory {
  allergies: string
}

export function HealthRecordTab() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("metrics")
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    id: 0,
    height: "",
    weight: "",
    blood_type: "",
  })
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistory>({
    allergies: "",
  })
  const [originalMetrics, setOriginalMetrics] = useState<HealthMetrics>(healthMetrics)
  const [originalHistory, setOriginalHistory] = useState<MedicalHistory>(medicalHistory)
  const { toast } = useToast()

  useEffect(() => {
    loadHealthRecords()
  }, [])

  const loadHealthRecords = async () => {
    try {
      setLoading(true)
      const patient = await patientService.getCurrentPatient()
      const healthData: HealthMetrics = {
        id: patient.id,
        height: patient.height?.toString() || "",
        weight: patient.weight?.toString() || "",
        blood_type: patient.blood_type || "",
      }
      const historyData: MedicalHistory = {
        allergies: patient.allergies || "",
      }
      setHealthMetrics(healthData)
      setMedicalHistory(historyData)
      setOriginalMetrics(healthData)
      setOriginalHistory(historyData)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải hồ sơ sức khỏe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateBMI = () => {
    if (healthMetrics.height && healthMetrics.weight) {
      const heightInMeters = Number.parseInt(healthMetrics.height) / 100
      const weightInKg = Number.parseInt(healthMetrics.weight)
      return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1)
    }
    return ""
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await patientService.updatePatient(healthMetrics.id.toString(), {
        height: healthMetrics.height ? Number.parseInt(healthMetrics.height) : undefined,
        weight: healthMetrics.weight ? Number.parseInt(healthMetrics.weight) : undefined,
        blood_type: healthMetrics.blood_type,
        allergies: medicalHistory.allergies,
      })
      setOriginalMetrics(healthMetrics)
      setOriginalHistory(medicalHistory)
      setIsEditing(false)
      toast({
        title: "Thành công",
        description: "Hồ sơ sức khỏe đã được cập nhật",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật hồ sơ sức khỏe",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setHealthMetrics(originalMetrics)
    setMedicalHistory(originalHistory)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hồ sơ sức khỏe</CardTitle>
        <CardDescription>Quản lý thông tin sức khỏe của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList>
            <TabsTrigger value="metrics">Chỉ số sức khỏe</TabsTrigger>
            <TabsTrigger value="history">Lịch sử y khoa</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            {isEditing ? (
              <div className="flex justify-end gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" /> Lưu
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  <X className="mr-2 h-4 w-4" /> Hủy
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)} disabled={loading}>
                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
              </Button>
            )}
          </div>
          {activeSubTab === "metrics" && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="height" className="text-right">Chiều cao (cm)</Label>
                <Input
                  id="height"
                  value={healthMetrics.height}
                  onChange={(e) =>
                    setHealthMetrics({ ...healthMetrics, height: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="weight" className="text-right">Cân nặng (kg)</Label>
                <Input
                  id="weight"
                  value={healthMetrics.weight}
                  onChange={(e) =>
                    setHealthMetrics({ ...healthMetrics, weight: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bmi" className="text-right">Chỉ số BMI</Label>
                <Input
                  id="bmi"
                  value={calculateBMI()}
                  disabled
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="blood_type" className="text-right">Nhóm máu</Label>
                <Select
                  value={healthMetrics.blood_type}
                  onValueChange={(value) =>
                    setHealthMetrics({ ...healthMetrics, blood_type: value })
                  }
                  disabled={!isEditing || loading}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn nhóm máu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          {activeSubTab === "history" && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allergies" className="text-right">Dị ứng</Label>
                <Textarea
                  id="allergies"
                  value={medicalHistory.allergies}
                  onChange={(e) =>
                    setMedicalHistory({ ...medicalHistory, allergies: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}