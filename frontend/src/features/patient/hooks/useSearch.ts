"use client"

import { useState, useMemo } from "react"
import type { Doctor } from "../../../shared/types"

export function useSearch(doctors: Doctor[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("")

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const matchesQuery =
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSpecialty = selectedSpecialty === "" || doctor.specialty === selectedSpecialty

      return matchesQuery && matchesSpecialty
    })
  }, [doctors, searchQuery, selectedSpecialty])

  return {
    searchQuery,
    setSearchQuery,
    selectedSpecialty,
    setSelectedSpecialty,
    filteredDoctors,
  }
}
