from rest_framework import serializers
from .models import Prescription, PrescriptionDetail, Medicine
from patients.models import Patient
from doctors.models import Doctor
from common.enums import Gender, AcademicDegree
from common.constants import PHARMACY_LENGTH, COMMON_LENGTH, USER_LENGTH, PATIENT_LENGTH, DOCTOR_LENGTH, MIN_VALUE, DECIMAL_MAX_DIGITS, DECIMAL_DECIMAL_PLACES


class PrescriptionDetailInfoSerializer(serializers.Serializer):
    medicine_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"])
    unit = serializers.CharField(max_length=PHARMACY_LENGTH["UNIT"])
    dosage = serializers.CharField(max_length=PHARMACY_LENGTH["DOSAGE"])
    frequency = serializers.CharField(max_length=PHARMACY_LENGTH["FREQUENCY"])
    duration = serializers.CharField(max_length=PHARMACY_LENGTH["DURATION"])
    prescription_notes = serializers.CharField(allow_blank=True)
    quantity = serializers.IntegerField()


class PrescriptionPdfDtoSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    patient_first_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"])
    patient_last_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"])
    patient_gender = serializers.ChoiceField(choices=[(g.value, g.name) for g in Gender])
    patient_birthday = serializers.DateField()
    patient_phone = serializers.CharField(max_length=USER_LENGTH["PHONE"])
    patient_email = serializers.EmailField()
    patient_address = serializers.CharField(max_length=COMMON_LENGTH["ADDRESS"], allow_blank=True)
    patient_identity_number = serializers.CharField(max_length=PATIENT_LENGTH["IDENTITY"])
    patient_insurance_number = serializers.CharField(max_length=PATIENT_LENGTH["INSURANCE"])
    doctor_first_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"], required=True)
    doctor_last_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"], required=True)
    doctor_specialization = serializers.CharField(max_length=DOCTOR_LENGTH["SPECIALIZATION"], required=True)
    doctor_academic_degree = serializers.ChoiceField(choices=[(a.value, a.name) for a in AcademicDegree])
    doctor_department = serializers.CharField(
        max_length=DOCTOR_LENGTH["DEPARTMENT_NAME"],
        allow_blank=True
    )
    prescription_id = serializers.IntegerField()
    prescription_date = serializers.DateField()
    diagnosis = serializers.CharField()
    systolic_blood_pressure = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True)
    diastolic_blood_pressure = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True)
    heart_rate = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True)
    blood_sugar = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True)
    note = serializers.CharField(
        max_length=PHARMACY_LENGTH["PRESCRIPTION_NOTE"],
        allow_blank=True
    )
    follow_up_date = serializers.DateField(allow_null=True)
    follow_up = serializers.BooleanField()
    prescription_details = PrescriptionDetailInfoSerializer(many=True)


class PrescriptionDetailRequestSerializer(serializers.Serializer):
    medicine_id = serializers.IntegerField()
    dosage = serializers.CharField(max_length=PHARMACY_LENGTH["DOSAGE"])
    frequency = serializers.CharField(max_length=PHARMACY_LENGTH["FREQUENCY"])
    duration = serializers.CharField(max_length=PHARMACY_LENGTH["DURATION"])
    prescription_notes = serializers.CharField(allow_blank=True)
    quantity = serializers.IntegerField(min_value=MIN_VALUE)


class CreatePrescriptionRequestSerializer(serializers.Serializer):
    appointment_id = serializers.IntegerField()
    patient_id = serializers.IntegerField()
    follow_up_date = serializers.DateField(allow_null=True)
    is_follow_up = serializers.BooleanField(default=False)
    diagnosis = serializers.CharField()
    systolic_blood_pressure = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True)
    diastolic_blood_pressure = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True)
    heart_rate = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True)
    blood_sugar = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True)
    note = serializers.CharField(
        max_length=PHARMACY_LENGTH["PRESCRIPTION_NOTE"],
        allow_blank=True
    )
    prescription_details = PrescriptionDetailRequestSerializer(many=True, allow_null=True)


class UpdatePrescriptionRequestSerializer(serializers.Serializer):
    follow_up_date = serializers.DateField(allow_null=True, required=False)
    is_follow_up = serializers.BooleanField(required=False)
    diagnosis = serializers.CharField(required=False)
    systolic_blood_pressure = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True, required=False)
    diastolic_blood_pressure = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True, required=False)
    heart_rate = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True, required=False)
    blood_sugar = serializers.IntegerField(min_value=MIN_VALUE, allow_null=True, required=False)
    note = serializers.CharField(
        max_length=PHARMACY_LENGTH["PRESCRIPTION_NOTE"], 
        allow_blank=True,
        required=False
    )
    prescription_details = PrescriptionDetailRequestSerializer(many=True, allow_null=True, required=False)


class AddMedicineToPrescriptionRequestSerializer(serializers.Serializer):
    prescription_id = serializers.IntegerField()
    medicine_id = serializers.IntegerField()
    dosage = serializers.CharField(max_length=PHARMACY_LENGTH["DOSAGE"])
    frequency = serializers.CharField(max_length=PHARMACY_LENGTH["FREQUENCY"])
    duration = serializers.CharField(max_length=PHARMACY_LENGTH["DURATION"])
    prescription_notes = serializers.CharField(allow_blank=True)
    quantity = serializers.IntegerField(min_value=MIN_VALUE)


class UpdatePrescriptionDetailRequestSerializer(serializers.Serializer):
    detail_id = serializers.IntegerField()
    dosage = serializers.CharField(max_length=PHARMACY_LENGTH["DOSAGE"], required=False)
    frequency = serializers.CharField(max_length=PHARMACY_LENGTH["FREQUENCY"], required=False)
    duration = serializers.CharField(max_length=PHARMACY_LENGTH["DURATION"], required=False)
    prescription_notes = serializers.CharField(allow_blank=True, required=False)
    quantity = serializers.IntegerField(min_value=MIN_VALUE, required=False)


class PrescriptionDetailSerializer(serializers.ModelSerializer):
    medicine = serializers.SerializerMethodField()

    class Meta:
        model = PrescriptionDetail
        fields = [
            'id', 'prescription', 'medicine', 'dosage', 'frequency',
            'duration', 'prescription_notes', 'quantity', 'created_at'
        ]

    def get_medicine(self, obj):
        return {'medicine_id': obj.medicine.id, 'medicine_name': obj.medicine.medicine_name, 'price': obj.medicine.price}


class PrescriptionSerializer(serializers.ModelSerializer):
    prescription_details = PrescriptionDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Prescription
        fields = [
            'id', 'patient', 'appointment', 'follow_up_date',
            'is_follow_up', 'diagnosis', 'systolic_blood_pressure',
            'diastolic_blood_pressure', 'heart_rate', 'blood_sugar', 'note',
            'prescription_details', 'created_at'
        ]


class NewMedicineRequestSerializer(serializers.Serializer):
    medicine_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"])
    manufactor = serializers.CharField(
        max_length=COMMON_LENGTH["NAME"],
        allow_blank=True,
        required=False
    )
    category = serializers.CharField(max_length=PHARMACY_LENGTH["CATEGORY"])
    description = serializers.CharField(allow_blank=True, required=False)
    usage = serializers.CharField(allow_blank=True, required=False)
    unit = serializers.CharField(max_length=PHARMACY_LENGTH["UNIT"])
    is_insurance_covered = serializers.BooleanField(default=False)
    insurance_discount_percent = serializers.FloatField(allow_null=True, required=False)
    insurance_discount = serializers.DecimalField(
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_DECIMAL_PLACES,
        allow_null=True,
        required=False
    )
    side_effects = serializers.CharField(allow_blank=True, required=False)
    price = serializers.DecimalField(
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_DECIMAL_PLACES,
        min_value=0
    )
    quantity = serializers.IntegerField(min_value=0, required=False)


class UpdateMedicineRequestSerializer(serializers.Serializer):
    medicine_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"], required=False)
    manufactor = serializers.CharField(
        max_length=COMMON_LENGTH["NAME"],
        allow_blank=True,
        required=False
    )
    category = serializers.CharField(max_length=PHARMACY_LENGTH["CATEGORY"], required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    usage = serializers.CharField(allow_blank=True, required=False)
    unit = serializers.CharField(max_length=PHARMACY_LENGTH["UNIT"], required=False)
    is_insurance_covered = serializers.BooleanField(required=False)
    insurance_discount_percent = serializers.FloatField(allow_null=True, required=False)
    insurance_discount = serializers.DecimalField(
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_DECIMAL_PLACES,
        allow_null=True,
        required=False
    )
    side_effects = serializers.CharField(allow_blank=True, required=False)
    price = serializers.DecimalField(
        max_digits=DECIMAL_MAX_DIGITS,
        decimal_places=DECIMAL_DECIMAL_PLACES,
        min_value=0,
        required=False
    )
    quantity = serializers.IntegerField(min_value=0, required=False)


class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = [
            'id', 'medicine_name', 'manufactor', 'category',
            'description', 'usage', 'unit', 'is_insurance_covered',
            'insurance_discount_percent', 'insurance_discount', 'side_effects',
            'price', 'quantity', 'created_at'
        ]
