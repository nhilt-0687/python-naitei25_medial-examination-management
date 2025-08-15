from rest_framework import serializers
from .models import Patient, EmergencyContact
from common.enums import Gender
from common.constants import PATIENT_LENGTH, COMMON_LENGTH, USER_LENGTH, ENUM_LENGTH, DOCTOR_LENGTH
from django.utils.translation import gettext_lazy as _


class EmergencyContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmergencyContact
        fields = ['id', 'contact_name', 'contact_phone', 'relationship', 'created_at', 'patient_id']


class CreatePatientRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=USER_LENGTH["PHONE"])
    password = serializers.CharField(max_length=USER_LENGTH["PASSWORD"])
    identity_number = serializers.CharField(max_length=PATIENT_LENGTH["IDENTITY"])
    insurance_number = serializers.CharField(
        max_length=PATIENT_LENGTH["INSURANCE"]
    )
    first_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"])
    last_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"])
    birthday = serializers.DateField()
    gender = serializers.ChoiceField(choices=[(g.value, g.name) for g in Gender])
    address = serializers.CharField(required=False)
    allergies = serializers.CharField(required=False)
    height = serializers.IntegerField(required=False)
    weight = serializers.IntegerField(required=False)
    blood_type = serializers.CharField(
        max_length=PATIENT_LENGTH["BLOOD_TYPE"],
        required=False
    )
    emergency_contact_dtos = EmergencyContactSerializer(many=True, required=False)
    avatar = serializers.CharField(max_length=PATIENT_LENGTH["AVATAR"], required=False, allow_blank=True, allow_null=True)

    def validate(self, data):
        required_fields = {
            "email": _("Email không được để trống"),
            "phone": _("Số điện thoại không được để trống"),
            "password": _("Mật khẩu không được để trống"),
            "identity_number": _("CCCD không được để trống"),
            "insurance_number": _("Số BHYT không được để trống"),
            "first_name": _("Tên không được để trống"),
            "last_name": _("Họ không được để trống"),
            "birthday": _("Ngày sinh không được để trống"),
            "gender": _("Giới tính không được để trống"),
        }

        errors = {}
        for field, message in required_fields.items():
            if not data.get(field):
                errors[field] = message

        if errors:
            raise serializers.ValidationError(errors)

        return data


class PatientSerializer(serializers.ModelSerializer):
    emergency_contacts = EmergencyContactSerializer(many=True, read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'identity_number', 'insurance_number', 'first_name', 'last_name',
            'birthday', 'gender', 'address', 'allergies', 'height', 'weight', 'blood_type',
            'avatar', 'created_at', 'emergency_contacts'
        ]
        extra_kwargs = {
            'user': {'read_only': True},
            'created_at': {'read_only': True},
        }
