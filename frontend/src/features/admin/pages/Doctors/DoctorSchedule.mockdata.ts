export interface DoctorScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  className?: string;
  extendedProps: {
    calendar: "morning" | "afternoon" | "surgery" | "meeting" | "working" | "free" | "break" | "vacation";
    startTime: string;
    endTime: string;
    department: string;
    location: string;
    type: "consultation" | "surgery" | "meeting" | "break";
    description?: string;
    colorClass?: string;
  };
}

export const generateDoctorScheduleEvents = (): DoctorScheduleEvent[] => {
  const today = new Date();
  const events: DoctorScheduleEvent[] = [];

  // Tạo lịch làm việc cho 30 ngày tiếp theo
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;    // Morning shift: 7:00 - 11:00
    events.push({
      id: `morning-${i}`,
      title: "Ca sáng - Khám bệnh",
      start: `${dateStr}T07:00:00`,
      end: `${dateStr}T11:00:00`,
      extendedProps: {
        calendar: "working",
        startTime: "07:00",
        endTime: "11:00",
        department: "Nội tim mạch",
        location: "Phòng khám P102",
        type: "consultation",
        description: "Khám và tư vấn bệnh nhân nội trú và ngoại trú"
      }
    });

    // Afternoon shift: 13:00 - 17:00
    events.push({
      id: `afternoon-${i}`,
      title: "Ca chiều - Khám bệnh",
      start: `${dateStr}T13:00:00`,
      end: `${dateStr}T17:00:00`,
      extendedProps: {
        calendar: "working",
        startTime: "13:00",
        endTime: "17:00",
        department: "Nội tim mạch",
        location: "Phòng khám P102",
        type: "consultation",
        description: "Khám và tư vấn bệnh nhân"
      }
    });

    // Random surgery or meeting
    if (Math.random() > 0.7) {
      events.push({
        id: `surgery-${i}`,
        title: "Phẫu thuật tim",
        start: `${dateStr}T08:00:00`,
        end: `${dateStr}T12:00:00`,
        extendedProps: {
          calendar: "working",
          startTime: "08:00",
          endTime: "12:00",
          department: "Phòng mổ",
          location: "Phòng mổ số 3",
          type: "surgery",
          description: "Phẫu thuật bypass động mạch vành"
        }
      });
    }

    // Random meetings
    if (Math.random() > 0.8) {
      events.push({
        id: `meeting-${i}`,
        title: "Hội chẩn khoa",
        start: `${dateStr}T14:00:00`,
        end: `${dateStr}T15:00:00`,
        extendedProps: {
          calendar: "working",
          startTime: "14:00",
          endTime: "15:00",
          department: "Phòng họp",
          location: "Phòng họp tầng 3",
          type: "meeting",
          description: "Hội chẩn các ca bệnh phức tạp"
        }
      });
    }
  }

  // Thêm một số ngày nghỉ phép
  const vacationDay = new Date(today);
  vacationDay.setDate(today.getDate() + 15);
  events.push({
    id: "vacation-1",
    title: "Nghỉ phép",
    start: vacationDay.toISOString().split("T")[0],
    end: vacationDay.toISOString().split("T")[0],
    extendedProps: {
      calendar: "vacation",
      startTime: "00:00",
      endTime: "23:59",
      department: "",
      location: "",
      type: "break",
      description: "Nghỉ phép cá nhân"
    }
  });
  return events;
};