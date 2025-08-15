import type { Doctor as BackendDoctor } from '../types/api'
import type { Doctor as FrontendDoctor } from '../types'

export function transformDoctorData(backendDoctor: BackendDoctor): FrontendDoctor {
  return {
    id: backendDoctor.id,
    user: backendDoctor.user,
    department: backendDoctor.department,
    identity_number: backendDoctor.identity_number,
    first_name: backendDoctor.first_name,
    last_name: backendDoctor.last_name,
    birthday: backendDoctor.birthday,
    gender: backendDoctor.gender,
    address: backendDoctor.address,
    academic_degree: backendDoctor.academic_degree,
    specialization: backendDoctor.specialization,
    type: backendDoctor.type,
    created_at: backendDoctor.created_at,
    updated_at: backendDoctor.updated_at,
    
    // Computed properties for frontend
    name: `${getAcademicDegreePrefix(backendDoctor.academic_degree)} ${backendDoctor.first_name} ${backendDoctor.last_name}`,
    specialty: backendDoctor.department.department_name,
    avatar: `/placeholder.svg?height=60&width=60&text=${backendDoctor.first_name.charAt(0)}${backendDoctor.last_name.charAt(0)}`,
    rating: Math.random() * 0.5 + 4.5, // Mock rating for now
    room: `Phòng ${Math.floor(Math.random() * 100) + 1} - Lầu ${Math.floor(Math.random() * 5) + 1} Khu ${String.fromCharCode(65 + Math.floor(Math.random() * 3))}`,
    consultationFee: Math.floor(Math.random() * 200000) + 150000, // Mock fee
  }
}

function getAcademicDegreePrefix(degree: string): string {
  switch (degree) {
    case 'BACHELOR':
      return 'BS.'
    case 'MASTER':
      return 'ThS BS.'
    case 'DOCTOR':
      return 'BSCKII.'
    case 'PROFESSOR':
      return 'PGS.TS.'
    default:
      return 'BS.'
  }
}

export function transformGenderToVietnamese(gender: string): string {
  switch (gender) {
    case 'MALE':
      return 'Nam'
    case 'FEMALE':
      return 'Nữ'
    case 'OTHER':
      return 'Khác'
    default:
      return 'Không xác định'
  }
}

export function transformSpecializationToSpecialty(specialization: string): { name: string; icon: string; color: string } {
  // Map specialization to specialty with icons
  const specialtyMap: Record<string, { name: string; icon: string; color: string }> = {
    'Tim mạch': { name: 'Tim mạch', icon: 'Heart', color: 'bg-cyan-500' },
    'Sản nhi': { name: 'Sản nhi', icon: 'Baby', color: 'bg-cyan-500' },
    'Nha khoa': { name: 'Nha khoa', icon: 'Tooth', color: 'bg-green-500' },
    'Da liễu': { name: 'Da liễu', icon: 'User', color: 'bg-purple-500' },
    'Thần kinh': { name: 'Thần kinh', icon: 'Brain', color: 'bg-cyan-500' },
    'Tiêu hóa': { name: 'Tiêu hóa', icon: 'FlaskConical', color: 'bg-cyan-500' },
  }

  return specialtyMap[specialization] || { name: specialization, icon: 'Stethoscope', color: 'bg-cyan-500' }
}
