"use client"

import React, { useState, useEffect } from 'react'
import { User, Phone, Mail, Calendar, MapPin, Heart, Droplets, Ruler, Weight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { patientService } from '../../../../../shared/services/patientService'
import { useAuth } from '../../../../../shared/context/AuthContext'
import type { Patient, PatientDto, EmergencyContact, EmergencyContactDto } from '../../../../../shared/types/patient'

const PatientProfile: React.FC = () => {
  const { user } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [editForm, setEditForm] = useState<Partial<PatientDto>>({})
  const [newContact, setNewContact] = useState<EmergencyContactDto>({
    contactName: '',
    contactPhone: '',
    relationship: 'FAMILY'
  })

  useEffect(() => {
    if (user?.userId) {
      loadPatientData()
    }
  }, [user])

  const loadPatientData = async () => {
    try {
      setIsLoading(true)
      // Assuming patient ID is same as user ID for simplicity
      const patientData = await patientService.getPatientById(user!.userId)
      setPatient(patientData)
      setEditForm(patientData)

      const contacts = await patientService.getEmergencyContacts(patientData.patientId)
      setEmergencyContacts(contacts)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!patient) return

    try {
      setIsLoading(true)
      const updatedPatient = await patientService.updatePatient(
        patient.patientId.toString(),
        editForm
      )
      setPatient(updatedPatient)
      setIsEditing(false)
      setSuccess('Cập nhật thông tin thành công!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddContact = async () => {
    if (!patient || !newContact.contactName || !newContact.contactPhone) return

    try {
      const contact = await patientService.addEmergencyContact(patient.patientId, newContact)
      setEmergencyContacts([...emergencyContacts, contact])
      setNewContact({ contactName: '', contactPhone: '', relationship: 'FAMILY' })
      setSuccess('Thêm liên hệ khẩn cấp thành công!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleDeleteContact = async (contactId: number) => {
    if (!patient) return

    try {
      await patientService.deleteEmergencyContact(patient.patientId, contactId)
      setEmergencyContacts(emergencyContacts.filter(c => c.contactId !== contactId))
      setSuccess('Xóa liên hệ khẩn cấp thành công!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error: any) {
      setError(error.message)
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'Nam'
      case 'FEMALE': return 'Nữ'
      case 'OTHER': return 'Khác'
      default: return gender
    }
  }

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'FAMILY': return 'Gia đình'
      case 'FRIEND': return 'Bạn bè'
      case 'OTHERS': return 'Khác'
      default: return relationship
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert>
          <AlertDescription>
            Không tìm thấy thông tin bệnh nhân. Vui lòng liên hệ hỗ trợ.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
            <CardDescription>
              Quản lý thông tin cá nhân và y tế của bạn
            </CardDescription>
          </div>
          <Button
            variant={isEditing ? "outline" : "default"}
            onClick={() => {
              if (isEditing) {
                setEditForm(patient)
              }
              setIsEditing(!isEditing)
            }}
          >
            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Họ và tên</label>
              {isEditing ? (
                <Input
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{patient.fullName}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Số CCCD</label>
              {isEditing ? (
                <Input
                  value={editForm.identityNumber || ''}
                  onChange={(e) => setEditForm({...editForm, identityNumber: e.target.value})}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{patient.identityNumber}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Số BHYT</label>
              {isEditing ? (
                <Input
                  value={editForm.insuranceNumber || ''}
                  onChange={(e) => setEditForm({...editForm, insuranceNumber: e.target.value})}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{patient.insuranceNumber}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Ngày sinh</label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editForm.birthday || ''}
                  onChange={(e) => setEditForm({...editForm, birthday: e.target.value})}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(patient.birthday).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Giới tính</label>
              {isEditing ? (
                <Select
                  value={editForm.gender || ''}
                  onValueChange={(value) => setEditForm({...editForm, gender: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Nam</SelectItem>
                    <SelectItem value="FEMALE">Nữ</SelectItem>
                    <SelectItem value="OTHER">Khác</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-sm text-gray-900">{getGenderLabel(patient.gender)}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Nhóm máu</label>
              {isEditing ? (
                <Select
                  value={editForm.bloodType || ''}
                  onValueChange={(value) => setEditForm({...editForm, bloodType: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                  <Droplets className="h-4 w-4 text-red-500" />
                  {patient.bloodType}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Chiều cao (cm)</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editForm.height || ''}
                  onChange={(e) => setEditForm({...editForm, height: Number(e.target.value)})}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                  <Ruler className="h-4 w-4 text-blue-500" />
                  {patient.height} cm
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Cân nặng (kg)</label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editForm.weight || ''}
                  onChange={(e) => setEditForm({...editForm, weight: Number(e.target.value)})}
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                  <Weight className="h-4 w-4 text-green-500" />
                  {patient.weight} kg
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
            {isEditing ? (
              <Textarea
                value={editForm.address || ''}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                rows={2}
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 flex items-start gap-1">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                {patient.address}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Dị ứng</label>
            {isEditing ? (
              <Textarea
                value={editForm.allergies || ''}
                onChange={(e) => setEditForm({...editForm, allergies: e.target.value})}
                rows={2}
                placeholder="Mô tả các loại dị ứng (nếu có)"
              />
            ) : (
              <p className="mt-1 text-sm text-gray-900 flex items-start gap-1">
                <Heart className="h-4 w-4 text-red-500 mt-0.5" />
                {patient.allergies || 'Không có'}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveProfile} disabled={isLoading}>
                {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditForm(patient)
                  setIsEditing(false)
                }}
              >
                Hủy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Liên hệ khẩn cấp
          </CardTitle>
          <CardDescription>
            Quản lý danh sách liên hệ khẩn cấp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new contact form */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Thêm liên hệ mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Tên liên hệ"
                value={newContact.contactName}
                onChange={(e) => setNewContact({...newContact, contactName: e.target.value})}
              />
              <Input
                placeholder="Số điện thoại"
                value={newContact.contactPhone}
                onChange={(e) => setNewContact({...newContact, contactPhone: e.target.value})}
              />
              <div className="flex gap-2">
                <Select
                  value={newContact.relationship}
                  onValueChange={(value) => setNewContact({...newContact, relationship: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FAMILY">Gia đình</SelectItem>
                    <SelectItem value="FRIEND">Bạn bè</SelectItem>
                    <SelectItem value="OTHERS">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddContact} size="sm">
                  Thêm
                </Button>
              </div>
            </div>
          </div>

          {/* Existing contacts */}
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <div key={contact.contactId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{contact.contactName}</p>
                  <p className="text-sm text-gray-600">{contact.contactPhone}</p>
                  <p className="text-xs text-gray-500">{getRelationshipLabel(contact.relationship)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteContact(contact.contactId)}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa
                </Button>
              </div>
            ))}
            {emergencyContacts.length === 0 && (
              <p className="text-center text-gray-500 py-4">Chưa có liên hệ khẩn cấp nào</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PatientProfile
