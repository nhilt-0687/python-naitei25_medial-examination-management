from rest_framework import serializers
from django.core.validators import RegexValidator
from django.utils.translation import gettext as _
from .models import User
from common.constants import USER_LENGTH, COMMON_LENGTH, REGEX_PATTERNS
from common.enums import Gender, UserRole

class UserRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"], required=False)
    phone = serializers.CharField(
        max_length=USER_LENGTH["PHONE"],
        required=False,
        validators=[RegexValidator(REGEX_PATTERNS["PHONE"], message=_("Số điện thoại không hợp lệ"))]
    )
    password = serializers.CharField(max_length=USER_LENGTH["PASSWORD"])
    role = serializers.ChoiceField(choices=[(role.value, role.name) for role in UserRole], required=False)

    def validate(self, data):
        required_fields = ["password"]
        required_messages = {
            "email_or_phone": _("Phải cung cấp email hoặc số điện thoại"),
            "password": _("Mật khẩu không được để trống"),
        }
        
        errors = {}
        
        if not data.get('email') and not data.get('phone'):
            errors["email"] = required_messages["email_or_phone"]
            errors["phone"] = required_messages["email_or_phone"]
        
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        
        if errors:
            raise serializers.ValidationError(errors)
        return data

class UserUpdateRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"], required=False)
    phone = serializers.CharField(
        max_length=USER_LENGTH["PHONE"], 
        required=False, 
        validators=[RegexValidator(REGEX_PATTERNS["PHONE"], message=_("Số điện thoại không hợp lệ"))]
    )
    password = serializers.CharField(max_length=USER_LENGTH["PASSWORD"], required=False)
    role = serializers.ChoiceField(choices=[(role.value, role.name) for role in UserRole], required=False)

class UserResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'role', 'created_at']

class PagedResponseSerializer(serializers.Serializer):
    content = UserResponseSerializer(many=True)
    page = serializers.IntegerField()
    size = serializers.IntegerField()
    totalElements = serializers.IntegerField()
    totalPages = serializers.IntegerField()
    last = serializers.BooleanField()

class ChangePasswordRequestSerializer(serializers.Serializer):
    oldPassword = serializers.CharField(max_length=USER_LENGTH["PASSWORD"], required=False)
    newPassword = serializers.CharField(max_length=USER_LENGTH["PASSWORD"])
    adminReset = serializers.BooleanField(required=False, default=False)  

    def validate(self, data):
        required_fields = ["newPassword"]
        required_messages = {
            "newPassword": _("Mật khẩu mới không được để trống"),
        }
        errors = {}
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        if errors:
            raise serializers.ValidationError(errors)
        return data

class RegisterRequestSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=USER_LENGTH["PASSWORD"])
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"])  
    phone = serializers.CharField(
        max_length=USER_LENGTH["PHONE"], 
        required=False,
        validators=[RegexValidator(REGEX_PATTERNS["PHONE"], message=_("Số điện thoại không hợp lệ"))]
    )
    fullName = serializers.CharField(max_length=USER_LENGTH["FULL_NAME"])
    identityNumber = serializers.CharField(
        max_length=COMMON_LENGTH["IDENTITY_NUMBER"],
        validators=[RegexValidator(REGEX_PATTERNS["IDENTITY_NUMBER"], message=_("CCCD phải có đúng 12 chữ số"))],
        help_text=_("Căn cước công dân (12 chữ số)")
    )
    insuranceNumber = serializers.CharField(max_length=COMMON_LENGTH["INSURANCE_NUMBER"])
    birthday = serializers.DateField()
    gender = serializers.ChoiceField(choices=[(gender.value, gender.name) for gender in Gender])
    address = serializers.CharField(max_length=COMMON_LENGTH["ADDRESS"])

    def validate(self, data):
        required_fields = ["password", "email", "fullName", "identityNumber", "insuranceNumber", "birthday", "gender", "address"]
        required_messages = {
            "password": _("Mật khẩu không được để trống"),
            "email": _("Email không được để trống"), 
            "fullName": _("Họ tên không được để trống"),
            "identityNumber": _("CCCD không được để trống"),
            "insuranceNumber": _("Số bảo hiểm y tế không được để trống"),
            "birthday": _("Ngày sinh không được để trống"),
            "gender": _("Giới tính không được để trống"),
            "address": _("Địa chỉ không được để trống"),
        }
        errors = {}
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        if errors:
            raise serializers.ValidationError(errors)
        return data

class RegisterVerifyRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"])  
    otp = serializers.CharField(max_length=COMMON_LENGTH["OTP"])               
        
    def validate(self, data):
        required_fields = ["email", "otp"]
        required_messages = {
            "email": _("Email không được để trống"),
            "otp": _("Mã OTP không được để trống"),
        }
        errors = {}
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        if errors:
            raise serializers.ValidationError(errors)
        return data

class LoginFlexibleRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"], required=False)
    phone = serializers.CharField(
        max_length=USER_LENGTH["PHONE"], 
        required=False,
        validators=[RegexValidator(REGEX_PATTERNS["PHONE"], message=_("Số điện thoại không hợp lệ"))]
    )
    password = serializers.CharField(max_length=USER_LENGTH["PASSWORD"])

    def validate(self, data):
        required_fields = ["password"]
        required_messages = {
            "email_or_phone": _("Phải cung cấp email hoặc số điện thoại"),
            "password": _("Mật khẩu không được để trống"),
        }
        
        errors = {}
        
        if not data.get('email') and not data.get('phone'):
            errors["email"] = required_messages["email_or_phone"]
            errors["phone"] = required_messages["email_or_phone"]
        
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        
        if errors:
            raise serializers.ValidationError(errors)
        return data

class ResetPasswordRequestSerializer(serializers.Serializer):
    resetToken = serializers.CharField(max_length=COMMON_LENGTH["TOKEN"])
    password = serializers.CharField(max_length=USER_LENGTH["PASSWORD"])

    def validate(self, data):
        required_fields = ["resetToken", "password"]
        required_messages = {
            "resetToken": _("Token đặt lại không được để trống"),
            "password": _("Mật khẩu không được để trống"),
        }
        errors = {}
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        if errors:
            raise serializers.ValidationError(errors)
        return data

class ForgotPasswordEmailRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"])

    def validate(self, data):
        required_fields = ["email"]
        required_messages = {
            "email": _("Email không được để trống"),
        }
        errors = {}
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        if errors:
            raise serializers.ValidationError(errors)
        return data

class ResendOtpRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"])

    def validate(self, data):
        required_fields = ["email"]
        required_messages = {
            "email": _("Email không được để trống"),
        }
        errors = {}
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        if errors:
            raise serializers.ValidationError(errors)
        return data

class VerifyOtpRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"])
    otp = serializers.CharField(max_length=COMMON_LENGTH["OTP"])

    def validate(self, data):
        required_fields = ["email", "otp"]
        required_messages = {
            "email": _("Email không được để trống"),
            "otp": _("Mã OTP không được để trống"),
        }
        errors = {}
        for field in required_fields:
            if not data.get(field):
                errors[field] = required_messages[field]
        if errors:
            raise serializers.ValidationError(errors)
        return data

class LoginResponseSerializer(serializers.Serializer):
    token = serializers.CharField()

class UserResponseAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'role']
