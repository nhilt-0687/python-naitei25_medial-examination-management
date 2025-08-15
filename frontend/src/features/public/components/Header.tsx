"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Heart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Trang chủ", href: "/" },
  { name: "Bác sĩ", href: "/doctors" },
  { name: "Chuyên khoa", href: "/specialties" },
  { name: "Về chúng tôi", href: "/about" },
  { name: "Liên hệ", href: "/contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Hàm kiểm tra active link
  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/"
    return location.pathname.startsWith(href)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex justify-center">
              <img className="w-30 pb-10 pt-10" src="/public/images/logo/logo.png" alt="logo" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "font-medium transition-colors pb-1",
                  isActive(item.href)
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-700 hover:text-teal-600"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth/patient-login")}
                  className="text-gray-700 hover:text-teal-600"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={() => navigate("/auth/register")}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Đăng ký
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/dashboard")}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Dashboard
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "font-medium",
                    isActive(item.href)
                      ? "text-teal-600 font-semibold"
                      : "text-gray-700 hover:text-teal-600"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {!isAuthenticated ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        navigate("/auth/patient-login")
                        setMobileMenuOpen(false)
                      }}
                      className="justify-start text-gray-700 hover:text-teal-600"
                    >
                      Đăng nhập
                    </Button>
                    <Button
                      onClick={() => {
                        navigate("/auth/register")
                        setMobileMenuOpen(false)
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      Đăng ký
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      navigate("/dashboard")
                      setMobileMenuOpen(false)
                    }}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Dashboard
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
