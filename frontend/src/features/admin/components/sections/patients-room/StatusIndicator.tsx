interface StatusIndicatorProps {
  status: string
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return "text-green-600"
      case "Xét nghiệm":
        return "text-blue-500"
      case "Đang chờ":
        return "text-yellow-500"
      default:
        return "text-gray-600"
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-green-600"
      case "Xét nghiệm":
        return "bg-blue-500"
      case "Đang chờ":
        return "bg-yellow-500"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="flex items-center">
      <div className={`w-2 h-2 rounded-full ${getStatusDot(status)} mr-2`}></div>
      <span className={getStatusColor(status)}>{status}</span>
    </div>
  )
}
