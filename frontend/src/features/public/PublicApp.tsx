import type React from "react"
import { Routes, Route } from "react-router-dom"
import { HomeLayout } from "./layouts/HomeLayout"
import HomePage from "./pages/HomePage"
import DoctorsPage from "./pages/DoctorsPage"
import SpecialtiesPage from "./pages/SpecialtiesPage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"
import NotFound from "../../shared/components/common/NotFound"
import { ScrollToTop } from "../../shared/components/common/ScrollToTop"

export const PublicApp: React.FC = () => {
  console.log("PublicApp rendering...")

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<HomeLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route index element={<HomePage />} />
          <Route path="/doctors" element={<DoctorsPage />} />
          <Route path="/specialties" element={<SpecialtiesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default PublicApp
