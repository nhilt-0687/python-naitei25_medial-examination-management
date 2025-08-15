export const LocalStorageKeys = {
  AUTH_TOKEN: "authToken",
  AUTH_USER: "authUser",
  AUTH_ROLE: "authRole",
  CURRENT_USER_ID: "currentUserId",
  CURRENT_DOCTOR_ID: "currentDoctorId",
  DOCTOR_INFO: "doctorInfo",
  ADMIN_INFO: "adminInfo",
  RECEPTIONIST_INFO: "receptionistInfo",
  DOCTOR_TYPE: 'doctorType',
  LANGUAGE: "language",
  LOCALE: "locale",
  RECENT_SEARCHES: 'recent_searches',
  SEARCH_FILTERS: 'search_filters',
  BOOKING_DATA: 'booking_data',
  SELECTED_DOCTOR: 'selected_doctor',
  SELECTED_SERVICE: 'selected_service',
  NOTIFICATION_SETTINGS: 'notification_settings',
  UNREAD_NOTIFICATIONS: 'unread_notifications'
} as const;

export type LocalStorageKey = typeof LocalStorageKeys[keyof typeof LocalStorageKeys];