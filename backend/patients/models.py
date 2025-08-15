from django.db import models
from core.models import BaseModel
from common.enums import Gender
from common.constants import PATIENT_LENGTH, COMMON_LENGTH, USER_LENGTH, ENUM_LENGTH
from users.models import User

class Patient(BaseModel):
    user = models.OneToOneField(User, on_delete=models.RESTRICT)
    identity_number = models.CharField(
        max_length=PATIENT_LENGTH["IDENTITY"],
        unique=True
    )
    insurance_number = models.CharField(
        max_length=PATIENT_LENGTH["INSURANCE"],
        unique=True
    )
    first_name = models.CharField(max_length=COMMON_LENGTH["NAME"])
    last_name = models.CharField(max_length=COMMON_LENGTH["NAME"])
    birthday = models.DateField()
    gender = models.CharField(
        max_length=ENUM_LENGTH["DEFAULT"],
        choices=[(g.value, g.name) for g in Gender]
    )
    address = models.CharField(
        max_length=COMMON_LENGTH["ADDRESS"],
        blank=True, null=True
    )
    allergies = models.TextField(blank=True, null=True)
    height = models.IntegerField(blank=True, null=True)
    weight = models.IntegerField(blank=True, null=True)
    blood_type = models.CharField(
        max_length=PATIENT_LENGTH["BLOOD_TYPE"],
        blank=True, null=True
    )
    avatar = models.CharField(max_length=PATIENT_LENGTH["AVATAR"], blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class EmergencyContact(BaseModel):
    patient = models.ForeignKey(Patient, on_delete=models.RESTRICT)
    contact_name = models.CharField(max_length=COMMON_LENGTH["NAME"])
    contact_phone = models.CharField(max_length=USER_LENGTH["PHONE"])
    relationship = models.CharField(max_length=PATIENT_LENGTH["RELATIONSHIP"])

    def __str__(self):
        return f"{self.contact_name} ({self.relationship})"
