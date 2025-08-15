# ======================
# Numeric constraints
# ======================
DECIMAL_MAX_DIGITS = 10
DECIMAL_DECIMAL_PLACES = 2
DECIMAL_DEFAULT = 0

PAGE_NO_DEFAULT = 0
PAGE_SIZE_DEFAULT = 30
MIN_VALUE = 1

# ======================
# Regex patterns
# ======================
REGEX_PATTERNS = {
    "PHONE": r'^(\+84|0)\d{9,10}$',
    "IDENTITY_NUMBER": r'^\d{12}$',  
}

# ======================
# Enum char field length
# ======================
ENUM_LENGTH = {
    "DEFAULT": 20
}

# ======================
# Common field length
# ======================
COMMON_LENGTH = {
    "NAME": 100,
    "ADDRESS": 255,
    "NOTE": 255,
    "TITLE": 100,
    "TOKEN": 255,
    "URL": 255,
    "PUBLIC_ID": 100,
    "IDENTITY_NUMBER": 12, 
    "INSURANCE_NUMBER": 50,
    "OTP": 6,
    "RESET_TOKEN": 6,
}

# ======================
# User domain
# ======================
USER_LENGTH = {
    "EMAIL": 100,
    "PASSWORD": 255,
    "PHONE": 20,
    "FULL_NAME": 100,
}

# ======================
# Patient domain
# ======================
PATIENT_LENGTH = {
    "IDENTITY": 20,
    "INSURANCE": 50,
    "BLOOD_TYPE": 10,
    "RELATIONSHIP": 50,
    "AVATAR": 255,
}

# ======================
# Doctor domain
# ======================
DOCTOR_LENGTH = {
    "DEPARTMENT_NAME": 100,
    "BUILDING": 20,
    "SPECIALIZATION": 100,
    "ROOM_NOTE": 255,
    "ACADEMIC_DEGREE": 10,
    "AVATAR": 255,
}

# ======================
# Service domain
# ======================
SERVICE_LENGTH = {
    "SERVICE_NAME": 100,
}

# ======================
# Payment domain
# ======================
PAYMENT_LENGTH = {
    "ITEM_TYPE": 20,
    "STATUS": 2,
}

# ======================
# Pharmacy & Prescription domain
# ======================
PHARMACY_LENGTH = {
    "UNIT": 50,
    "CATEGORY": 50,
    "DOSAGE": 100,
    "FREQUENCY": 50,
    "DURATION": 50,
    "PRESCRIPTION_NOTE": 255,
}

ALL_SLOTS = [
    {"slot_start": "08:00", "slot_end": "08:15"},
    {"slot_start": "08:15", "slot_end": "08:30"},
    {"slot_start": "08:30", "slot_end": "08:45"},
    {"slot_start": "08:45", "slot_end": "09:00"},
]

# ======================
# Appointment per slot domain
# ======================
SCHEDULE_DEFAULTS = {
    "MAX_PATIENTS": 10,
    "CURRENT_PATIENTS": 0,
    "APPOINTMENT_DURATION_MINUTES": 30,
    "MINUTES": 60,
}
