interface PatientStatusBadgeProps {
  status: string
}

export default function PatientStatusBadge({ status }: PatientStatusBadgeProps) {
  let color = "info"

  if (status === "Hoàn thành") {
    color = "success"
  } else if (status === "Đang chờ") {
    color = "warning"
  } else if (status === "Xét nghiệm") {
    color = "info"
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-800`}>
      {status}
    </span>
  )
}
