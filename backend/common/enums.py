from enum import Enum

class UserRole(Enum):
    ADMIN = "A"
    DOCTOR = "D"
    PATIENT = "P"

class Gender(Enum):
    MALE = "M"
    FEMALE = "F"
    OTHER = "O"

class AcademicDegree(Enum):
    BS = "B"
    BS_CKI = "C1"
    BS_CKII = "C2"
    ThS_BS = "T1"
    TS_BS = "T2"
    PGS_TS_BS = "P1"
    GS_TS_BS = "G1"

class DoctorType(Enum):
    EXAMINATION = "E"
    SERVICE = "S"

class Shift(Enum):
    MORNING = "M"
    AFTERNOON = "A"
    EVENING = "E"
    NIGHT = "N"

class AppointmentStatus(Enum):
    PENDING = "P"
    CONFIRMED = "C"
    CANCELLED = "X"
    COMPLETED = "D"
    NO_SHOW = "N" 
    IN_PROGRESS = "I"

class ServiceType(Enum):
    TEST = "T"
    IMAGING = "I"
    CONSULTATION = "C"
    OTHER = "O"

class OrderStatus(Enum):
    ORDERED = "O"
    COMPLETED = "C"

class NoteType(Enum):
    DOCTOR = "D"
    PATIENT = "P"

class PaymentStatus(Enum):
    PAID = "P"
    UNPAID = "U"

class PaymentMethod(Enum):
    CASH = "C"
    ONLINE_BANKING = "B"
    CARD = "D"

class TransactionStatus(Enum):
    SUCCESS = "S"
    FAILED = "F"
    PENDING = "P"

class NotificationType(Enum):
    SYSTEM = "S"
    BILL = "B"
    APPOINTMENT = "A"
    FOLLOWUP = "F"
    OTHER = "O"

class Relationship(Enum):
    FAMILY = "F"
    FRIEND = "R"
    OTHERS = "O"

class RoomType(Enum):
    EXAMINATION = "E"
    TEST = "T"
