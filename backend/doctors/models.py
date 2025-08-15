from django.db import models
from core.models import BaseModel
from users.models import User
from common.enums import Gender, AcademicDegree, DoctorType, RoomType, Shift
from common.constants import DOCTOR_LENGTH, COMMON_LENGTH, PATIENT_LENGTH, ENUM_LENGTH, SCHEDULE_DEFAULTS, DECIMAL_MAX_DIGITS, DECIMAL_DECIMAL_PLACES

class ScheduleStatus(models.TextChoices):
    AVAILABLE = "AVAILABLE", "Available"
    FULL = "FULL", "Full"

class Department(BaseModel):
    department_name = models.CharField(max_length=DOCTOR_LENGTH["DEPARTMENT_NAME"])
    description = models.TextField(blank=True, null=True)
    avatar = models.CharField(max_length=DOCTOR_LENGTH["AVATAR"], blank=True, null=True)

    def __str__(self):
        return self.department_name


class ExaminationRoom(BaseModel):
    department = models.ForeignKey(Department, on_delete=models.RESTRICT)
    type = models.CharField(max_length=ENUM_LENGTH["DEFAULT"], choices=[(r.value, r.name) for r in RoomType])
    building = models.CharField(max_length=DOCTOR_LENGTH["BUILDING"])
    floor = models.IntegerField()
    note = models.CharField(max_length=DOCTOR_LENGTH["ROOM_NOTE"], blank=True, null=True)

    def __str__(self):
        return f"{self.department.department_name} - {self.building} {self.floor}"


class Doctor(BaseModel):
    user = models.ForeignKey(User, on_delete=models.RESTRICT)
    identity_number = models.CharField(max_length=PATIENT_LENGTH["IDENTITY"], unique=True)
    first_name = models.CharField(max_length=COMMON_LENGTH["NAME"])
    last_name = models.CharField(max_length=COMMON_LENGTH["NAME"])
    birthday = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=ENUM_LENGTH["DEFAULT"], choices=[(g.value, g.name) for g in Gender])
    address = models.CharField(max_length=COMMON_LENGTH["ADDRESS"], blank=True, null=True)
    academic_degree = models.CharField(
        max_length=DOCTOR_LENGTH["ACADEMIC_DEGREE"],
        choices=[(a.value, a.name) for a in AcademicDegree]
    )
    specialization = models.CharField(max_length=DOCTOR_LENGTH["SPECIALIZATION"])
    type = models.CharField(max_length=ENUM_LENGTH["DEFAULT"], choices=[(d.value, d.name) for d in DoctorType])
    department = models.ForeignKey(Department, on_delete=models.RESTRICT)
    avatar = models.CharField(max_length=DOCTOR_LENGTH["AVATAR"], blank=True, null=True)
    price = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES, blank=True, null=True)

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name}"


class Schedule(BaseModel):
    doctor = models.ForeignKey(Doctor, on_delete=models.RESTRICT)
    work_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    shift = models.CharField(max_length=ENUM_LENGTH["DEFAULT"], choices=[(s.value, s.name) for s in Shift])
    room = models.ForeignKey(ExaminationRoom, on_delete=models.RESTRICT)
    max_patients = models.IntegerField(default=SCHEDULE_DEFAULTS["MAX_PATIENTS"])
    current_patients = models.IntegerField(default=SCHEDULE_DEFAULTS["CURRENT_PATIENTS"])
    status = models.CharField(
        max_length=ENUM_LENGTH["DEFAULT"],
        choices=ScheduleStatus.choices,
        default=ScheduleStatus.AVAILABLE
    )
    default_appointment_duration_minutes = models.IntegerField(default=SCHEDULE_DEFAULTS["APPOINTMENT_DURATION_MINUTES"])

    def __str__(self):
        return f"Schedule {self.doctor} {self.work_date} {self.shift}"
