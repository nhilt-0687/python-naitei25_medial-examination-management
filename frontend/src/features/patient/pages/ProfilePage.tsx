"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalInfoTab } from "../components/common/Profile/PersonalInfoTab"
import { InsuranceInfoTab } from "../components/common/Profile/InsuranceInfoTab"
import { EmergencyContactTab } from "../components/common/Profile/EmergencyContactTab"
import { HealthRecordTab } from "../components/common/Profile/HealthRecordTab"
import { User, Shield, Phone, Heart } from "lucide-react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal")

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Hồ sơ cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin cá nhân và sức khỏe của bạn</p>
      </div>

      <Card className="border shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger
              value="personal"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Thông tin cá nhân</span>
              <span className="sm:hidden">Cá nhân</span>
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Bảo hiểm</span>
              <span className="sm:hidden">BH</span>
            </TabsTrigger>
            <TabsTrigger
              value="emergency"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Liên hệ khẩn cấp</span>
              <span className="sm:hidden">Khẩn cấp</span>
            </TabsTrigger>
            <TabsTrigger
              value="health"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Hồ sơ sức khỏe</span>
              <span className="sm:hidden">Sức khỏe</span>
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="personal" className="mt-0">
              <PersonalInfoTab />
            </TabsContent>

            <TabsContent value="insurance" className="mt-0">
              <InsuranceInfoTab />
            </TabsContent>

            <TabsContent value="emergency" className="mt-0">
              <EmergencyContactTab />
            </TabsContent>

            <TabsContent value="health" className="mt-0">
              <HealthRecordTab />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}

