"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import viLocale from "@fullcalendar/core/locales/vi";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import PageMeta from "../../components/PageMeta";
import ReturnButton from "../../components/ReturnButton";
import { Modal } from "../../components/index";
import { useModal } from "../../hooks/useModal";
import { scheduleService, ScheduleResponse } from "../../services/scheduleService";
import { doctorService } from "../../services/doctorServices";
import { useTranslation } from "react-i18next";

// Interface for schedule events
interface DoctorScheduleEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    allDay?: boolean;
    backgroundColor?: string;
    borderColor?: string;
    className?: string;
    extendedProps: {
        calendar:
            | "morning"
            | "afternoon"
            | "evening"
            | "night"
            | "surgery"
            | "meeting"
            | "working"
            | "free"
            | "break"
            | "vacation";
        startTime: string;
        endTime: string;
        department: string;
        location: string;
        type: "consultation" | "surgery" | "meeting" | "break";
        description?: string;
        colorClass?: string;
        roomId?: number;
    };
}

// Function to normalize time format
const normalizeTime = (time: string): string => {
    if (!time) return time;
    const parts = time.split(':');
    if (parts.length === 3) {
        return `${parts[0]}:${parts[1]}:00`;
    }
    if (parts.length === 2) {
        return `${time}:00`;
    }
    return time;
};

// Function to format time to Vietnamese style
const formatTimeToVietnamese = (time: string): string => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hourNum = parseInt(hours, 10);
    const minuteNum = parseInt(minutes, 10);
    return `${hourNum}:${minuteNum.toString().padStart(2, "0")}`;
};

// Function to format date to Vietnamese style (dd/mm/yyyy)
const formatDateToVietnamese = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString();
    return `${day}/${month}/${year}`;
};

// Function to format calendar title in Vietnamese format
const formatCalendarTitle = (date: Date, t: (key: string) => string): string => {
    const monthNames = [
        t("months.january"),
        t("months.february"),
        t("months.march"),
        t("months.april"),
        t("months.may"),
        t("months.june"),
        t("months.july"),
        t("months.august"),
        t("months.september"),
        t("months.october"),
        t("months.november"),
        t("months.december"),
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

interface DoctorData {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    dateOfBirth: string;
    department: string;
    doctorId: string;
    accountType: string;
    position: string;
    specialty: string;
    address: string;
    country: string;
    city: string;
    postalCode: string;
    avatar: string;
}

function Schedule() {
    const { t } = useTranslation();
    const doctorInfo = JSON.parse(localStorage.getItem("doctorInfo") || "{}");
    const doctorId = doctorInfo?.id ? Number(doctorInfo.id) : undefined;
    if (!doctorId) {
        return <Navigate to="/not-found" replace />;
    }
    const calendarRef = useRef<FullCalendar>(null);
    const { isOpen, openModal, closeModal } = useModal();
    const [events, setEvents] = useState<DoctorScheduleEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<DoctorScheduleEvent | null>(null);
    const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
    const [rooms, setRooms] = useState<
        {
            roomId: number;
            note: string;
            building: string;
            floor: number;
            type?: string;
        }[]
    >([]);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editEvent, setEditEvent] = useState({
        date: "",
        startTime: "",
        endTime: "",
        calendar: "morning" as "morning" | "afternoon" | "evening" | "night" | "surgery" | "meeting",
    });
    const [errorModal, setErrorModal] = useState<{
        open: boolean;
        message: string;
    }>({ open: false, message: "" });
    const [successModal, setSuccessModal] = useState<{
        open: boolean;
        message: string;
    }>({ open: false, message: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!doctorId) return;
            try {
                console.log("Fetching data for doctorId:", doctorId);

                try {
                    if (typeof doctorService?.getDoctorById === "function") {
                        const doctor = await doctorService.getDoctorById(doctorId);
                        console.log("Doctor data:", doctor);
                        setDoctorData({
                            firstName: "",
                            lastName: "",
                            fullName: doctor.fullName || "",
                            email: "",
                            phone: "",
                            gender: "",
                            dateOfBirth: "",
                            department: "",
                            doctorId: doctor.doctorId?.toString() || "",
                            accountType: "",
                            position: "",
                            specialty: "",
                            address: "",
                            country: "",
                            city: "",
                            postalCode: "",
                            avatar: "",
                        });
                    }
                } catch (error) {
                    console.log("Could not fetch doctor details:", error);
                }

                const schedules = await scheduleService.getSchedulesByDoctorId(doctorId);
                console.log(t("log.schedulesFetched"), doctorId, ":", schedules);

                if (schedules.length === 0) {
                    console.warn(t("log.noSchedulesFound"), doctorId);
                    setEvents([]);
                    return;
                }

                const filteredSchedules = schedules.filter((sch: ScheduleResponse) => sch.doctor_id === doctorId);

                const events = filteredSchedules
                    .map((sch: ScheduleResponse, index) => {
                        const workDate = sch.work_date;
                        const startTime = normalizeTime(sch.start_time);
                        const endTime = normalizeTime(sch.end_time);

                        if (!workDate || !startTime || !endTime) {
                            console.error(t("log.skipScheduleMissingData", { id: sch.id, workDate, startTime, endTime }));
                            return null;
                        }

                        const calendarType =
                            sch.shift?.toUpperCase() === "M"
                                ? "morning"
                                : sch.shift?.toUpperCase() === "A"
                                ? "afternoon"
                                : sch.shift?.toUpperCase() === "E"
                                ? "evening"
                                : sch.shift?.toUpperCase() === "N"
                                ? "night"
                                : "morning";

                        const eventType = "consultation";

                        let colorClass = "fc-bg-success";
                        if (calendarType === "afternoon") {
                            colorClass = "fc-bg-waiting";
                        } else if (calendarType === "morning") {
                            colorClass = "fc-bg-waiting";
                        } else if (calendarType === "evening") {
                            colorClass = "fc-bg-cancel";
                        } else if (calendarType === "night") {
                            colorClass = "fc-bg-cancel";
                        } else if (calendarType === "surgery") {
                            colorClass = "fc-bg-danger";
                        } else if (calendarType === "meeting") {
                            colorClass = "fc-bg-success";
                        }

                        const startDateTimeFull = `${workDate}T${startTime}`;
                        const endDateTimeFull = `${workDate}T${endTime}`;

                        const startDateObj = new Date(startDateTimeFull);
                        const endDateObj = new Date(endDateTimeFull);

                        if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                            console.error(t("log.invalidDate", { id: sch.id, start: startDateTimeFull, end: endDateTimeFull }));
                            return null;
                        }

                        const event: DoctorScheduleEvent = {
                            id: String(sch.id),
                            title:
                                sch.title ||
                                t(`shifts.${calendarType}`) ||
                                t("shifts.morning"),
                            start: startDateObj.toISOString(),
                            end: endDateObj.toISOString(),
                            allDay: false,
                            className: `event-fc-color ${colorClass}`,
                            extendedProps: {
                                calendar: calendarType,
                                startTime: startTime,
                                endTime: endTime,
                                department: sch.building || "",
                                location: sch.room_note || "",
                                type: eventType,
                                description: "",
                                colorClass: colorClass,
                                roomId: sch.room_id,
                            },
                        };
                        return event;
                    })
                    .filter(Boolean);

                console.log("Final events:", events);
                setEvents(events);

                if (events.length > 0) {
                    const firstEventDate = new Date(events[0]!.start);
                    setTimeout(() => {
                        if (calendarRef.current) {
                            const calendarApi = calendarRef.current.getApi();
                            calendarApi.gotoDate(firstEventDate);
                        }
                    }, 100);
                } else {
                    console.log(t("log.noValidEvents"));
                }
            } catch (error) {
                console.error(t("log.errorFetchingSchedules"), error);
            }
        };
        if (events.length === 0) fetchData();
    }, [doctorId, events, t]);

    const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRoomId(Number(e.target.value));
    };

    const handleEventClick = (clickInfo: EventClickArg) => {
        console.log(t("log.eventClicked"), clickInfo.event);
        console.log(t("log.modalStateBefore"), isOpen);
        const event = clickInfo.event;
        console.log(t("log.eventDetails"), {
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            extendedProps: event.extendedProps,
        });

        const eventData = {
            id: String(event.id || ''),
            title: event.title,
            start: event.start?.toISOString() || "",
            end: event.end?.toISOString() || "",
            allDay: event.allDay || false,
            extendedProps: event.extendedProps,
        } as DoctorScheduleEvent;

        console.log(t("log.setSelectedEvent"), eventData);
        setSelectedEvent(eventData);
        openModal();

        setTimeout(() => {
            console.log(t("log.modalStateAfter"), isOpen);
            console.log(t("log.selectedEventAfter"), selectedEvent);
        }, 100);
    };

    const handleCloseModal = () => {
        closeModal();
        setSelectedEvent(null);
        setIsEditMode(false);
    };

    const handleStartEdit = () => {
        if (selectedEvent) {
            const dateOnly = selectedEvent.start.split("T")[0];
            setEditEvent({
                date: dateOnly,
                startTime: selectedEvent.extendedProps.startTime.substring(0, 5),
                endTime: selectedEvent.extendedProps.endTime.substring(0, 5),
                calendar: selectedEvent.extendedProps.calendar,
            });

            if (selectedEvent.extendedProps.roomId) {
                setSelectedRoomId(selectedEvent.extendedProps.roomId);
            } else {
                const currentRoom = rooms.find(
                    (room) =>
                        room.note === selectedEvent.extendedProps.location &&
                        room.building === selectedEvent.extendedProps.department
                );
                setSelectedRoomId(currentRoom?.roomId || rooms[0]?.roomId || null);
            }
            setIsEditMode(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setEditEvent({
            date: "",
            startTime: "",
            endTime: "",
            calendar: "morning",
        });
    };

    const handleUpdateEvent = async () => {
        if (!selectedEvent) return;

        const requiresRoom = editEvent.calendar !== "meeting";

        if (
            !editEvent.date ||
            !editEvent.startTime ||
            !editEvent.endTime ||
            (requiresRoom && !selectedRoomId)
        ) {
            const missingFields = [];
            if (!editEvent.date) missingFields.push(t("fields.date"));
            if (!editEvent.startTime) missingFields.push(t("fields.startTime"));
            if (!editEvent.endTime) missingFields.push(t("fields.endTime"));
            if (requiresRoom && !selectedRoomId) missingFields.push(t("fields.room"));

            setErrorModal({
                open: true,
                message: t("errors.missingFields", { fields: missingFields.join(", ") }),
            });
            return;
        }

        if (editEvent.startTime >= editEvent.endTime) {
            setErrorModal({
                open: true,
                message: t("errors.startTimeBeforeEnd"),
            });
            return;
        }

        try {
            setIsSubmitting(true);
            if (!doctorId) throw new Error(t("errors.noDoctorId"));

            const payload = {
                scheduleId: Number(selectedEvent.id),
                doctor_id: doctorId,
                work_date: editEvent.date,
                start_time: editEvent.startTime + ":00",
                end_time: editEvent.endTime + ":00",
                shift:
                    editEvent.calendar === "surgery" || editEvent.calendar === "meeting"
                        ? "M"
                        : editEvent.calendar === "morning"
                        ? "M"
                        : editEvent.calendar === "afternoon"
                        ? "A"
                        : editEvent.calendar === "evening"
                        ? "E"
                        : editEvent.calendar === "night"
                        ? "N"
                        : "M",
                room_id:
                    editEvent.calendar === "meeting"
                        ? rooms[0]?.roomId || 1
                        : selectedRoomId || rooms[0]?.roomId || 1,
            };

            await scheduleService.updateSchedule(
                doctorId,
                payload.scheduleId,
                payload
            );

            setSuccessModal({
                open: true,
                message: t("success.updateSchedule"),
            });

            const schedules = await scheduleService.getSchedulesByDoctorId(doctorId);
            const events = schedules.map((sch: ScheduleResponse) => {
                const workDate = sch.work_date;
                const startTime = normalizeTime(sch.start_time);
                const endTime = normalizeTime(sch.end_time);

                if (!workDate || !startTime || !endTime) {
                    console.error(t("log.skipScheduleMissingData", { id: sch.id, workDate, startTime, endTime }));
                    return null;
                }

                const calendarType =
                    sch.shift?.toUpperCase() === "M"
                        ? "morning"
                        : sch.shift?.toUpperCase() === "A"
                        ? "afternoon"
                        : sch.shift?.toUpperCase() === "E"
                        ? "evening"
                        : sch.shift?.toUpperCase() === "N"
                        ? "night"
                        : "morning";

                const eventType = "consultation";

                let colorClass = "fc-bg-success";
                if (calendarType === "afternoon") {
                    colorClass = "fc-bg-cancel";
                } else if (calendarType === "morning") {
                    colorClass = "fc-bg-waiting";
                } else if (calendarType === "evening") {
                    colorClass = "fc-bg-indigo";
                } else if (calendarType === "night") {
                    colorClass = "fc-bg-amber";
                } else if (calendarType === "surgery") {
                    colorClass = "fc-bg-danger";
                } else if (calendarType === "meeting") {
                    colorClass = "fc-bg-success";
                }

                const startDateTimeFull = `${workDate}T${startTime}`;
                const endDateTimeFull = `${workDate}T${endTime}`;

                const startDateObj = new Date(startDateTimeFull);
                const endDateObj = new Date(endDateTimeFull);

                if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
                    console.error(t("log.invalidDate", { id: sch.id, start: startDateTimeFull, end: endDateTimeFull }));
                    return null;
                }

                return {
                    id: String(sch.id),
                    title:
                        sch.title ||
                        t(`shifts.${calendarType}`) ||
                        t("shifts.morning"),
                    start: startDateObj.toISOString(),
                    end: endDateObj.toISOString(),
                    allDay: false,
                    className: `event-fc-color ${colorClass}`,
                    extendedProps: {
                        calendar: calendarType as
                            | "morning"
                            | "afternoon"
                            | "evening"
                            | "night"
                            | "surgery"
                            | "meeting",
                        startTime: startTime,
                        endTime: endTime,
                        department: sch.building || "",
                        location: sch.room_note || "",
                        type: eventType as "consultation" | "surgery" | "meeting",
                        description: "",
                        colorClass: colorClass,
                        roomId: sch.room_id,
                    },
                };
            }).filter(Boolean);

            setEvents(events);
            setIsEditMode(false);
            setEditEvent({
                date: "",
                startTime: "",
                endTime: "",
                calendar: "morning",
            });
            closeModal();
            setSelectedEvent(null);
        } catch (err) {
            setErrorModal({
                open: true,
                message: t("errors.updateScheduleFailed"),
            });
            console.error(t("log.errorUpdatingEvent"), err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderEventContent = (eventInfo: {
        event: {
            title: string;
            extendedProps: {
                calendar: string;
                type: string;
                startTime: string;
                endTime: string;
                location?: string;
                department?: string;
                colorClass?: string;
            };
        };
        timeText: string;
    }) => {
        const startTime = formatTimeToVietnamese(eventInfo.event.extendedProps.startTime);
        const endTime = formatTimeToVietnamese(eventInfo.event.extendedProps.endTime);
        const timeRange = `${startTime} - ${endTime}`;

        return (
            <div>
                <div className="fc-daygrid-event-dot"></div>
                <div className="fc-event-time">{timeRange}</div>
                <div className="fc-event-title">{eventInfo.event.title}</div>
            </div>
        );
    };

    return (
        <div>
            <PageMeta
                title={t("meta.title", { name: doctorData?.id})}
                description={t("meta.description", {
                    name: doctorData?.id,
                    specialty: doctorData?.specialty || "",
                })}
            />
            <div className="flex justify-start items-center mb-6">
                <ReturnButton />
                <h3 className="font-semibold tracking-tight">
                    {t("header.schedule")}
                </h3>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="custom-calendar doctor-schedule-calendar">
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        initialDate={new Date()}
                        locale={viLocale}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth",
                        }}
                        events={events}
                        selectable={true}
                        eventClick={handleEventClick}
                        eventContent={renderEventContent}
                        height="auto"
                        slotMinTime="06:00:00"
                        slotMaxTime="24:00:00"
                        slotLabelFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }}
                        titleFormat={(info) => formatCalendarTitle(info.date.marker, t)}
                        dayHeaderFormat={{
                            weekday: "short",
                        }}
                        showNonCurrentDates={true}
                        fixedWeekCount={false}
                        weekends={true}
                        eventDisplay="block"
                        dayMaxEvents={true}
                        businessHours={{
                            daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
                            startTime: "07:00",
                            endTime: "24:00",
                        }}
                    />
                </div>

                {/* Modal chi tiết lịch làm việc */}
                <Modal
                    isOpen={isOpen}
                    onClose={handleCloseModal}
                    className="max-w-[500px] lg:p-8 mt-[20vh] mb-8"
                >
                    <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
                        <div>
                            <h5 className="mb-4 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-xl">
                                {t("modal.scheduleDetails")}
                            </h5>
                        </div>

                        {selectedEvent && (
                            <div className="space-y-4">
                                {!isEditMode ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.activity")}
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {selectedEvent.title}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.workingDate")}
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {formatDateToVietnamese(selectedEvent.start.split("T")[0])}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {t("fields.startTime")}
                                                    </label>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {formatTimeToVietnamese(selectedEvent.extendedProps.startTime)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {t("fields.endTime")}
                                                    </label>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {formatTimeToVietnamese(selectedEvent.extendedProps.endTime)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.location")}
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {selectedEvent.extendedProps.location}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.department")}
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    {selectedEvent.extendedProps.department}
                                                </div>
                                            </div>

                                            {selectedEvent.extendedProps.description && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {t("fields.description")}
                                                    </label>
                                                    <div className="p-3 bg-gray-50 rounded-lg">
                                                        {selectedEvent.extendedProps.description}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.status")}
                                                </label>
                                                <div className="p-3 bg-gray-50 rounded-lg">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            selectedEvent.extendedProps.calendar === "morning"
                                                                ? "bg-teal-100 text-base-800"
                                                                : selectedEvent.extendedProps.calendar === "afternoon"
                                                                ? "bg-purple-100 text-purple-800"
                                                                : selectedEvent.extendedProps.calendar === "evening"
                                                                ? "bg-indigo-100 text-indigo-800"
                                                                : selectedEvent.extendedProps.calendar === "night"
                                                                ? "bg-amber-100 text-amber-800"
                                                                : selectedEvent.extendedProps.calendar === "surgery"
                                                                ? "bg-red-100 text-red-800"
                                                                : "bg-blue-100 text-blue-800"
                                                        }`}
                                                    >
                                                        {t(`shifts.${selectedEvent.extendedProps.calendar}`)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                onClick={handleStartEdit}
                                                type="button"
                                                className="px-4 py-2.5 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-base-700"
                                            >
                                                {t("buttons.edit")}
                                            </button>
                                            <button
                                                onClick={handleCloseModal}
                                                type="button"
                                                className="btn btn-secondary flex justify-center rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-300"
                                            >
                                                {t("buttons.close")}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.date")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={editEvent.date}
                                                    onChange={(e) =>
                                                        setEditEvent({ ...editEvent, date: e.target.value })
                                                    }
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                                                    title={t("placeholders.selectWorkingDate")}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.shiftType")} <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={editEvent.calendar}
                                                    onChange={(e) =>
                                                        setEditEvent({
                                                            ...editEvent,
                                                            calendar: e.target.value as
                                                                | "morning"
                                                                | "afternoon"
                                                                | "evening"
                                                                | "night"
                                                                | "surgery"
                                                                | "meeting",
                                                        })
                                                    }
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                                                    title={t("placeholders.selectShiftType")}
                                                >
                                                    <option value="morning">{t("shifts.morning")}</option>
                                                    <option value="afternoon">{t("shifts.afternoon")}</option>
                                                    <option value="evening">{t("shifts.evening")}</option>
                                                    <option value="night">{t("shifts.night")}</option>
                                                    <option value="surgery">{t("shifts.surgery")}</option>
                                                    <option value="meeting">{t("shifts.meeting")}</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.startTime")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="time"
                                                    value={editEvent.startTime}
                                                    onChange={(e) =>
                                                        setEditEvent({
                                                            ...editEvent,
                                                            startTime: e.target.value,
                                                        })
                                                    }
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                                                    title={t("placeholders.selectStartTime")}
                                                    step="900"
                                                    min="00:00"
                                                    max="23:59"
                                                    data-format="24h"
                                                    lang="en-GB"
                                                    pattern="[0-9]{2}:[0-9]{2}"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.endTime")} <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="time"
                                                    value={editEvent.endTime}
                                                    onChange={(e) =>
                                                        setEditEvent({
                                                            ...editEvent,
                                                            endTime: e.target.value,
                                                        })
                                                    }
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                                                    title={t("placeholders.selectEndTime")}
                                                    step="900"
                                                    min="00:00"
                                                    max="23:59"
                                                    data-format="24h"
                                                />
                                            </div>
                                        </div>

                                        {editEvent.calendar !== "meeting" && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {t("fields.room")} <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={selectedRoomId ?? ""}
                                                    onChange={handleRoomChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-500/20 focus:border-base-500 outline-0"
                                                    disabled={rooms.length === 0}
                                                    title={t("placeholders.selectRoom")}
                                                >
                                                    <option value="">
                                                        {rooms.length === 0
                                                            ? t("placeholders.noRooms")
                                                            : t("placeholders.selectRoom", { count: rooms.length })}
                                                    </option>
                                                    {rooms.map((room) => (
                                                        <option key={room.roomId} value={String(room.roomId)}>
                                                            {t("fields.room")} {room.roomId}
                                                            {room.note ? ` - ${room.note}` : ""}
                                                            {room.building ? ` - ${room.building}` : ""}
                                                            {room.floor ? ` - ${t("fields.floor")} ${room.floor}` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                onClick={handleCancelEdit}
                                                type="button"
                                                className="px-4 py-2.5 text-sm font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                                            >
                                                {t("buttons.cancel")}
                                            </button>
                                            <button
                                                onClick={handleUpdateEvent}
                                                disabled={isSubmitting}
                                                type="button"
                                                className="px-4 py-2.5 text-sm font-medium text-white bg-base-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? t("buttons.updating") : t("buttons.update")}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </Modal>

                <Modal
                    isOpen={errorModal.open}
                    onClose={() => setErrorModal({ open: false, message: "" })}
                    className="max-w-[400px]"
                >
                    <div className="p-6">
                        <h4 className="text-lg font-semibold mb-2 text-red-600">{t("modal.error")}</h4>
                        <p className="mb-4">{errorModal.message}</p>
                        <button
                            onClick={() => setErrorModal({ open: false, message: "" })}
                            className="px-4 py-2 bg-base-600 text-white rounded-lg hover:bg-base-700"
                        >
                            {t("buttons.close")}
                        </button>
                    </div>
                </Modal>

                <Modal
                    isOpen={successModal.open}
                    onClose={() => setSuccessModal({ open: false, message: "" })}
                    className="max-w-[400px]"
                >
                    <div className="p-6">
                        <h4 className="text-lg font-semibold mb-2 text-base-600">{t("modal.success")}</h4>
                        <p className="mb-4">{successModal.message}</p>
                        <button
                            onClick={() => setSuccessModal({ open: false, message: "" })}
                            className="px-4 py-2 bg-base-600 text-white rounded-lg hover:bg-base-700"
                        >
                            {t("buttons.close")}
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default Schedule;
