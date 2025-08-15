import { EventInput } from "@fullcalendar/core";

export type EventStatus = "success" | "danger" | "warning" | "waiting";

export interface CalendarEventExtendedProps {
  calendar: EventStatus;
  patientName: string;
  patientId?: string;
  insuranceId?: string;
  phoneNumber?: string;
  patientAge?: number;
  symptoms?: string;
  eventTime?: string;
  doctorName?: string;
  department?: string;
  departmentId?: string;
  doctorId?: string;
}

export interface CalendarEvent extends EventInput {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: CalendarEventExtendedProps;
} 