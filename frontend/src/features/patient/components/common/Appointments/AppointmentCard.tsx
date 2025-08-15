"use client"

import React from "react"
import { Calendar, Clock, User, Stethoscope, FileText } from 'lucide-react'
import type { AppointmentDisplay } from "../../../../shared/utils/appointmentTransform"

interface AppointmentCardProps {
  appointment: AppointmentDisplay
  onClick?: () => void
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          {appointment.doctorAvatar ? (
            <img 
              src={appointment.doctorAvatar || "/placeholder.svg"} 
              alt={appointment.doctorName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-cyan-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{appointment.doctorName}</h3>
            <p className="text-sm text-gray-600">{appointment.doctorSpecialty}</p>
          </div>
        </div>
        
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${appointment.statusColor}`}>
          {appointment.status}
        </span>
      </div>

      {/* Appointment Details */}
      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{appointment.date}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>{appointment.time}</span>
        </div>

        {appointment.symptoms && (
          <div className="flex items-start text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-2 mt-0.5" />
            <span className="line-clamp-2">{appointment.symptoms}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500">
          <User className="w-4 h-4 mr-1" />
          <span>{appointment.patientName}</span>
        </div>
        
        <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
          Xem chi tiết
        </button>
      </div>
    </div>
  )
}

export default AppointmentCard
