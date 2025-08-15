export interface DoctorScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    calendar: "morning" | "afternoon" | "surgery" | "meeting" | "free" | "break" | "vacation";
    startTime: string;
    endTime: string;
    department: string;
    location: string;
    type: "consultation" | "surgery" | "meeting" | "break";
    description?: string;
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
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Tạo lịch không chồng chéo - chỉ chọn 1 loại hoạt động chính cho mỗi ngày
    const randomActivity = Math.random();
    
    if (randomActivity > 0.7) {
      // Ngày có phẫu thuật - chỉ có phẫu thuật và meeting sau đó
      events.push({
        id: `surgery-${i}`,
        title: "Phẫu thuật tim mạch",
        start: `${dateStr}T08:00:00`,
        end: `${dateStr}T12:00:00`,
        extendedProps: {
          calendar: "surgery",
          startTime: "08:00",
          endTime: "12:00",
          department: "Phòng mổ",
          location: "Phòng mổ số 3",
          type: "surgery",
          description: "Phẫu thuật bypass động mạch vành"
        }
      });

      // Thêm meeting sau phẫu thuật (không chồng chéo)
      if (Math.random() > 0.6) {
        events.push({
          id: `post-surgery-meeting-${i}`,
          title: "Hội chẩn sau phẫu thuật",
          start: `${dateStr}T14:00:00`,
          end: `${dateStr}T15:00:00`,
          extendedProps: {
            calendar: "meeting",
            startTime: "14:00",
            endTime: "15:00",
            department: "Phòng họp",
            location: "Phòng họp tầng 3",
            type: "meeting",
            description: "Thảo luận kết quả phẫu thuật"
          }
        });
      }
    } else if (randomActivity > 0.4) {
      // Ngày làm việc bình thường 
      events.push({
        id: `morning-${i}`,
        title: "Khám bệnh",
        start: `${dateStr}T07:00:00`,
        end: `${dateStr}T11:00:00`,
        extendedProps: {
          calendar: "morning",
          startTime: "07:00",
          endTime: "11:00",
          department: "Nội tim mạch",
          location: "Phòng khám P102",
          type: "consultation",
          description: "Khám và tư vấn bệnh nhân nội trú và ngoại trú"
        }
      });

      events.push({
        id: `afternoon-${i}`,
        title: "Khám bệnh",
        start: `${dateStr}T13:00:00`,
        end: `${dateStr}T17:00:00`,
        extendedProps: {
          calendar: "afternoon",
          startTime: "13:00",
          endTime: "17:00",
          department: "Nội tim mạch",
          location: "Phòng khám P102",
          type: "consultation",
          description: "Khám và tư vấn bệnh nhân"
        }
      });

      // Thêm meeting trong giờ nghỉ trưa (không chồng chéo)
      if (Math.random() > 0.7) {
        events.push({
          id: `lunch-meeting-${i}`,
          title: "Hội chẩn khoa",
          start: `${dateStr}T11:30:00`,
          end: `${dateStr}T12:30:00`,
          extendedProps: {
            calendar: "meeting",
            startTime: "11:30",
            endTime: "12:30",
            department: "Phòng họp",
            location: "Phòng họp tầng 3",
            type: "meeting",
            description: "Hội chẩn các ca bệnh phức tạp"
          }
        });
      }
    } else {
      // Ngày chỉ làm 1 ca (ca sáng ho)
      if (Math.random() > 0.5) {
        // Chỉ ca sáng
        events.push({
          id: `morning-only-${i}`,
          title: "Khám bệnh",
          start: `${dateStr}T07:00:00`,
          end: `${dateStr}T11:00:00`,
          extendedProps: {
            calendar: "morning",
            startTime: "07:00",
            endTime: "11:00",
            department: "Nội tim mạch",
            location: "Phòng khám P102",
            type: "consultation",
            description: "Khám và tư vấn bệnh nhân"
          }
        });
      } else {
        events.push({
          id: `afternoon-only-${i}`,
          title: "Khám bệnh",
          start: `${dateStr}T13:00:00`,
          end: `${dateStr}T17:00:00`,
          extendedProps: {
            calendar: "afternoon",
            startTime: "13:00",
            endTime: "17:00",
            department: "Nội tim mạch",
            location: "Phòng khám P102",
            type: "consultation",
            description: "Khám và tư vấn bệnh nhân"
          }
        });
      }
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