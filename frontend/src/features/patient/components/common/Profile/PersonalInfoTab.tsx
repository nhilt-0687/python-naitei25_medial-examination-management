"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, X, Upload, User, MapPin } from "lucide-react"
import { useToast } from "../../../hooks/useToast"
import { patientService } from "../../../../../shared/services/patientService"

interface PersonalInfo {
  id: number
  first_name: string
  last_name: string
  birthday: string
  gender: string
  address: string
  avatar?: string
  identity_number: string
  phone: string
  email: string
  city: string
  district: string
  ward: string
}

export function PersonalInfoTab() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState("basic")
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    id: 0,
    first_name: "",
    last_name: "",
    birthday: "",
    gender: "",
    address: "",
    avatar: "",
    identity_number: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    ward: "",
  })
  const [originalInfo, setOriginalInfo] = useState<PersonalInfo>(personalInfo)
  const { toast } = useToast()

  useEffect(() => {
    loadPersonalInfo()
  }, [])

  const loadPersonalInfo = async () => {
    try {
      setLoading(true)
      const patient = await patientService.getCurrentPatient()
      const personalData: PersonalInfo = {
        id: patient.id,
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        birthday: patient.birthday || "",
        gender: patient.gender || "",
        address: patient.address || "",
        avatar: patient.avatar || "",
        identity_number: patient.identity_number || "",
        phone: patient.phone || "",
        email: patient.email || "",
        city: "",
        district: "",
        ward: "",
      }
      setPersonalInfo(personalData)
      setOriginalInfo(personalData)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin cá nhân",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

    const handleSave = async () => {
    try {
        setLoading(true)

        const updateData = {
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        birthday: personalInfo.birthday,
        gender: personalInfo.gender as "M" | "F" | "O",
        address: personalInfo.address,
        identity_number: personalInfo.identity_number,
        }

        const updated = await patientService.updatePatient(
        personalInfo.id.toString(),
        updateData
        )

        setPersonalInfo(updated)
        setOriginalInfo(updated)
        setIsEditing(false)
        toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
        })
    } catch (error) {
        toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin",
        variant: "destructive",
        })
    } finally {
        setLoading(false)
    }
}


  const handleCancel = () => {
    setPersonalInfo(originalInfo)
    setIsEditing(false)
  }

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!personalInfo.id || personalInfo.id <= 0) {
        console.error("Invalid patientId:", personalInfo.id)
        toast({
        title: "Lỗi",
        description: "Thông tin bệnh nhân chưa được tải, vui lòng thử lại sau.",
        variant: "destructive",
        })
        return
    }

    if (file) {
        try {
        console.log("Uploading avatar for patientId:", personalInfo.id)
        setLoading(true)

        const result = await patientService.uploadAvatar(personalInfo.id.toString(), file)
        setPersonalInfo((prev) => ({
            ...prev,
            avatar: result.avatar,
        }))

        toast({
            title: "Thành công",
            description: "Ảnh đại diện đã được cập nhật",
        })
        } catch (error) {
        console.error("Upload avatar error:", error)
        toast({
            title: "Lỗi",
            description: "Không thể tải ảnh lên",
            variant: "destructive",
        })
        } finally {
        setLoading(false)
        }
    }
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList>
            <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
            {/* <TabsTrigger value="contact">Thông tin liên lạc</TabsTrigger> */}
            <TabsTrigger value="address">Địa chỉ</TabsTrigger>
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
          {activeSubTab === "basic" && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avatar" className="text-right">Ảnh đại diện</Label>
                <div className="col-span-3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={personalInfo.avatar} alt="Avatar" />
                    <AvatarFallback>
                      {personalInfo.first_name.charAt(0)}{personalInfo.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={loading}
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first_name" className="text-right">Tên</Label>
                <Input
                  id="first_name"
                  value={personalInfo.first_name}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, first_name: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last_name" className="text-right">Họ</Label>
                <Input
                  id="last_name"
                  value={personalInfo.last_name}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, last_name: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="birthday" className="text-right">Ngày sinh</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={personalInfo.birthday}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, birthday: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">Giới tính</Label>
                <Select
                  value={personalInfo.gender}
                  onValueChange={(value) =>
                    setPersonalInfo({ ...personalInfo, gender: value })
                  }
                  disabled={!isEditing || loading}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Nam</SelectItem>
                    <SelectItem value="F">Nữ</SelectItem>
                    <SelectItem value="O">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="identity_number" className="text-right">CCCD</Label>
                <Input
                  id="identity_number"
                  value={personalInfo.identity_number}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, identity_number: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          {activeSubTab === "contact" && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  value={personalInfo.email}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, email: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={personalInfo.phone}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, phone: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          {activeSubTab === "address" && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">Địa chỉ</Label>
                <Textarea
                  id="address"
                  value={personalInfo.address}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, address: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">Thành phố</Label>
                <Input
                  id="city"
                  value={personalInfo.city}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, city: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="district" className="text-right">Quận/Huyện</Label>
                <Input
                  id="district"
                  value={personalInfo.district}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, district: e.target.value })
                  }
                  disabled={!isEditing || loading}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ward" className="text-right">Phường/Xã</Label>
                <Input
                  id="ward"
                  value={personalInfo.ward}
                  onChange={(e) =>
                    setPersonalInfo({ ...personalInfo, ward: e.target.value })
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