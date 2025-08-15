from rest_framework import serializers
from .models import Doctor, Department, ExaminationRoom, Schedule, ScheduleStatus
from common.enums import Gender, AcademicDegree, DoctorType, Shift # Import Shift enum
from common.constants import DOCTOR_LENGTH, COMMON_LENGTH, PATIENT_LENGTH, ENUM_LENGTH, USER_LENGTH, DECIMAL_MAX_DIGITS, DECIMAL_DECIMAL_PLACES, REGEX_PATTERNS
from users.serializers import UserResponseSerializer
from django.utils.translation import gettext_lazy as _

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'department_name', 'description', 'avatar', 'created_at']

class ExaminationRoomSerializer(serializers.ModelSerializer):
    roomId = serializers.IntegerField(source='id', read_only=True)
    department_id = serializers.IntegerField(source='department.id', read_only=True)

    class Meta:
        model = ExaminationRoom
        fields = ['roomId', 'id', 'department', 'department_id', 'type', 'building', 'floor', 'note', 'created_at']

class ScheduleSerializer(serializers.ModelSerializer):
    # Fields for input (write-only) - expect integer IDs
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all(), write_only=True)
    room = serializers.PrimaryKeyRelatedField(queryset=ExaminationRoom.objects.all(), write_only=True)

    # Fields for output (read-only) - provide integer IDs
    doctor_id = serializers.IntegerField(source='doctor.id', read_only=True)
    room_id = serializers.IntegerField(source='room.id', read_only=True)

    # SerializerMethodFields for derived data (read-only)
    location = serializers.SerializerMethodField()
    building = serializers.SerializerMethodField()
    floor = serializers.SerializerMethodField()
    room_note = serializers.SerializerMethodField() 

    class Meta:
        model = Schedule
        # Explicitly list all fields for clarity and control
        fields = [
            'id', # Read-only primary key
            'doctor', # Write-only field for input doctor ID
            'room',   # Write-only field for input room ID
            'work_date',
            'start_time',
            'end_time',
            'shift',
            'max_patients',
            'current_patients',
            'status',
            'default_appointment_duration_minutes',
            'created_at', # Read-only timestamp

            # Read-only fields for output
            'doctor_id',
            'room_id',
            'location',
            'building',
            'floor',
            'room_note',
        ]
        # Ensure that fields that are read-only are explicitly marked as such
        read_only_fields = [
            'id', 'created_at', 'location', 'building', 'floor', 'room_note',
            'doctor_id', 'room_id', # These are read-only representations of the FKs
            'current_patients', 'status' # These have defaults and are updated by backend logic
        ]

    def get_location(self, obj):
        if obj.room:
            return _("Tòa {building}, tầng {floor}, phòng {room_note}").format(
                building=obj.room.building,
                floor=obj.room.floor,
                room_note=obj.room.note or ""
            )
        return ""

    def get_building(self, obj):
        return obj.room.building if obj.room else ""

    def get_floor(self, obj):
        return obj.room.floor if obj.room else None

    def get_room_note(self, obj):
        return obj.room.note if obj.room else ""

class CreateDoctorRequestSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=USER_LENGTH["PASSWORD"], required=True)
    identity_number = serializers.CharField(max_length=PATIENT_LENGTH["IDENTITY"], required=True)
    first_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"], required=True)
    last_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"], required=True)
    birthday = serializers.DateField(required=True)
    gender = serializers.ChoiceField(choices=[(g.value, g.name) for g in Gender])
    address = serializers.CharField(max_length=COMMON_LENGTH["ADDRESS"], required=False)
    academic_degree = serializers.ChoiceField(choices=[(a.value, a.name) for a in AcademicDegree])
    specialization = serializers.CharField(max_length=DOCTOR_LENGTH["SPECIALIZATION"], required=True)
    type = serializers.ChoiceField(choices=[(d.value, d.name) for d in DoctorType])
    department_id = serializers.IntegerField(required=True)
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"], required=False)
    avatar = serializers.CharField(max_length=DOCTOR_LENGTH["AVATAR"], required=False, allow_blank=True, allow_null=True)
    price = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES, required=False, allow_null=True)

    def validate(self, data):
        required_fields = {
            "password": _("Mật khẩu không được để trống"),
            "identity_number": _("CCCD không được để trống"),
            "first_name": _("Tên không được để trống"),
            "last_name": _("Họ không được để trống"),
            "birthday": _("Ngày sinh không được để trống"),
            "gender": _("Giới tính không được để trống"),
            "academic_degree": _("Học vấn không được để trống"),
            "specialization": _("Chuyên môn không được để trống"),
            "type": _("Loại bác sĩ không được để trống"),
            "department_id": _("ID khoa không được để trống"),
        }

        errors = {}
        for field, message in required_fields.items():
            if not data.get(field):
                errors[field] = message

        if not data.get('email') and not data.get('phone'):
            errors['email_or_phone'] = _("Email hoặc số điện thoại là bắt buộc")

        if errors:
            raise serializers.ValidationError(errors)

        return data


class DoctorSerializer(serializers.ModelSerializer):
    user = UserResponseSerializer(read_only=True)
    department = DepartmentSerializer(read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%dT%H:%M:%S", read_only=True)
    schedules = ScheduleSerializer(many=True, read_only=True, source='schedule_set')

    class Meta:
        model = Doctor
        fields = '__all__' # Đã thêm lại dòng này

class DoctorPartialUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = [
            'first_name', 'last_name', 'identity_number', 'birthday', 
            'gender', 'address', 'academic_degree', 'specialization', 
            'type', 'department', 'price', 'avatar'
        ]
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Đánh dấu tất cả fields là không bắt buộc cho partial update
        for field_name, field in self.fields.items():
            field.required = False

class DoctorUpdateSerializer(serializers.Serializer):
    """
    Serializer để cập nhật thông tin bác sĩ và user liên quan
    """
    # Doctor fields
    first_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"], required=False)
    last_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"], required=False)
    identity_number = serializers.CharField(max_length=PATIENT_LENGTH["IDENTITY"], required=False)
    birthday = serializers.DateField(required=False)
    gender = serializers.ChoiceField(choices=[(g.value, g.name) for g in Gender], required=False)
    address = serializers.CharField(max_length=COMMON_LENGTH["ADDRESS"], required=False)
    academic_degree = serializers.ChoiceField(choices=[(a.value, a.name) for a in AcademicDegree], required=False)
    specialization = serializers.CharField(max_length=DOCTOR_LENGTH["SPECIALIZATION"], required=False)
    type = serializers.ChoiceField(choices=[(d.value, d.name) for d in DoctorType], required=False)
    department_id = serializers.IntegerField(required=False)
    price = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES, required=False, allow_null=True)
    avatar = serializers.CharField(max_length=DOCTOR_LENGTH["AVATAR"], required=False, allow_blank=True, allow_null=True)
    
    # User fields
    email = serializers.EmailField(max_length=USER_LENGTH["EMAIL"], required=False)
    phone = serializers.CharField(max_length=USER_LENGTH["PHONE"], required=False)

    def validate(self, data):
        # Validate that at least one field is provided
        if not data:
            raise serializers.ValidationError(_("Ít nhất một trường phải được cung cấp để cập nhật"))
        
        # Validate email format if provided
        if 'email' in data and data['email']:
            from django.core.validators import validate_email
            try:
                validate_email(data['email'])
            except:
                raise serializers.ValidationError(_("Email không hợp lệ"))
        
        # Validate phone format if provided
        if 'phone' in data and data['phone']:
            from django.core.validators import RegexValidator
            phone_validator = RegexValidator(REGEX_PATTERNS["PHONE"], message=_("Số điện thoại không hợp lệ"))
            try:
                phone_validator(data['phone'])
            except:
                raise serializers.ValidationError(_("Số điện thoại không hợp lệ"))
        
        return data
