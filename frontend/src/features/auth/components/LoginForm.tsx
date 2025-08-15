"use client"

import type React from "react"

import { useState } from "react"
import { Form, Input, Button, Typography, Alert, ConfigProvider } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "../../../shared/context/AuthContext"
import { useNavigate } from "react-router-dom"
import PageMeta from "../../../shared/components/common/PageMeta"
import { doctorService } from "../../../shared/services/doctorService"
import { storage } from "../../../shared/utils/storage"
import { LocalStorageKeys } from "../../../shared/constants/storageKeys"
import LanguageSwitcher from "../../../shared/components/common/LanguageSwitcher"
import { VALIDATORS } from "../../../shared/constants/regex"
import axios from "axios"

const { Title } = Typography

const LoginForm: React.FC = () => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const { login, isLoading, error } = useAuth()
  const navigate = useNavigate()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isDoctorLoading, setIsDoctorLoading] = useState(false)

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      setLoginError(null)
      const success = await login(values)
      if (success) {
        const user = storage.get(LocalStorageKeys.AUTH_USER)
        console.log("User from storage:", user)
        if (user) {
          storage.setRaw(LocalStorageKeys.AUTH_ROLE, user.role)
          switch (user.role) {
            case "D":
              setIsDoctorLoading(true)
              try {
                const response = await doctorService.getDoctorByUserId(user.userId)
                console.log("Doctor response:", response)
                if (response && response.type) {
                  storage.setRaw(LocalStorageKeys.DOCTOR_TYPE, response.type)
                  if (response.type === "E") navigate("/doctor/examination")
                  else if (response.type === "S") navigate("/doctor/service")
                  else {
                    setLoginError(`${t("messages.invalidDoctorType")}: ${response.type}`)
                    navigate("/doctor")
                  }
                } else {
                  throw new Error(t("messages.doctorInfoNotFound"))
                }
              } catch (error) {
                setLoginError(t("messages.cannotGetDoctorInfo"))
                navigate("/")
              } finally {
                setIsDoctorLoading(false)
              }
              break
            case "A":
              navigate("/admin")
              break
            case "RECEPTIONIST":
              navigate("/receptionist")
              break
            case "P":
              navigate("/patient")
              break
            default:
              navigate("/")
              break
          }
        } else {
          setLoginError(t("messages.userInfoNotFound"))
          navigate("/")
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setLoginError(error.response?.data?.non_field_errors?.[0] || t("messages.loginError"))
      } else {
        setLoginError(t("messages.loginError"))
      }
      console.error(error)
    }
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#036672",
        },
      }}
    >
      <PageMeta
        title={`${t("auth.loginTitle")} Dashboard | Admin Dashboard`}
        description="This is SignIn Tables Dashboard"
      />
      <div className="flex-1">
        <div className="h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="absolute top-4 right-4 z-10">
            <LanguageSwitcher />
          </div>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Title level={2} className="text-gray-800 mb-2">
                {t("auth.loginTitle")}
              </Title>
            </div>

            {(error || loginError) && <Alert message={error || loginError} type="error" showIcon className="mb-4" />}

            <Form form={form} name="login" onFinish={onFinish} layout="vertical" size="large" className="space-y-4">
              <Form.Item
                name="email"
                label={<span className="text-gray-700 font-medium">{t("auth.email")}</span>}
                rules={[
                  { required: true, message: t("validation.emailRequired") },
                  {
                    validator: (_, value) => {
                      if (!value || VALIDATORS.email(value)) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error(t("validation.emailInvalid")))
                    },
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder={t("placeholders.enterEmail")}
                  autoComplete="username"
                  className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="text-gray-700 font-medium">{t("auth.password")}</span>}
                rules={[{ required: true, message: t("validation.passwordRequired") }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder={t("placeholders.enterPassword")}
                  autoComplete="current-password"
                  className="h-12 rounded-lg border-gray-200 hover:border-cyan-400 focus:border-cyan-500"
                />
              </Form.Item>

              <Form.Item className="mb-0 pt-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-cyan-600 to-base-600 hover:from-cyan-700 hover:to-base-700 border-none shadow-lg font-medium text-base"
                  loading={isLoading || isDoctorLoading}
                >
                  {t("auth.login")}
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center text-sm text-gray-500 mt-6">
              <p className="text-gray-500">{t("auth.hospitalSystem")}</p>
              <p>{t("auth.forAdminDoctor")}</p>
            </div>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}

export default LoginForm
