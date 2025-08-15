from django.db.models import Q
from django.core.mail import send_mail
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timedelta
from django.utils.translation import gettext as _
from .models import User
from patients.models import Patient 
from common.enums import UserRole, Gender
from common.constants import COMMON_LENGTH

class JwtService:
    @staticmethod
    def generate_token(user):
        refresh = RefreshToken.for_user(user)
        refresh['role'] = user.role
        refresh['userId'] = str(user.id)
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }

class AuthService:
    pending_registrations = {}
    pending_expirations = {}
    
    @transaction.atomic
    def pre_register(self, data):
        email = data.get('email')
        phone = data.get('phone')
        
        if email and User.objects.filter(email=email, is_deleted=False).exists():
            raise ValidationError(_("Email đã được sử dụng"))
            
        if phone and User.objects.filter(phone=phone, is_deleted=False).exists():
            raise ValidationError(_("Số điện thoại đã được sử dụng"))
        
        gender = data['gender']
        if gender not in [g.value for g in Gender]:
            raise ValidationError(_("Giới tính không hợp lệ. Chỉ chấp nhận: M, F, O"))
        
        identifier = email
        
        AuthService.pending_registrations[identifier] = data
        AuthService.pending_expirations[identifier] = datetime.now() + timedelta(minutes=10)
        
        OtpService().send_otp_to_email(email)
        
        return _("Mã OTP đã được gửi đến email của bạn")

    @classmethod
    def complete_registration(cls, data):
        email = data['email']
    
        cls._cleanup_expired_registrations()
    
        if email not in cls.pending_registrations:
            raise ValidationError(_("Thông tin đăng ký không tìm thấy hoặc đã hết hạn")) 
    
        register_data = cls.pending_registrations.get(email)
        if not register_data:
            raise ValidationError(_("Không tìm thấy thông tin đăng ký hoặc đã hết hạn"))
    
        otp_response = OtpService().validate_otp_by_email(email, data['otp'])

        if otp_response.get('resetToken') != 'SUCCESS':
            raise ValidationError(otp_response.get('resetToken', _('Xác thực OTP thất bại')))
    
        user = User.objects.create_user(
            email=register_data.get('email'),
            phone=register_data.get('phone'),
            password=register_data['password'],
            role=UserRole.PATIENT.value,
            is_verified=True
        )
    
        full_name = register_data['fullName']
        name_parts = full_name.strip().split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''

        Patient.objects.create(
            user=user,
            identity_number=register_data['identityNumber'], 
            insurance_number=register_data['insuranceNumber'],
            first_name=first_name,
            last_name=last_name,
            birthday=register_data['birthday'],
            gender=register_data['gender'],
            address=register_data['address']
        )
    
        cls.pending_registrations.pop(email, None)
        cls.pending_expirations.pop(email, None)
    
        return {'id': user.id, 'role': user.role}
    
    @classmethod
    def _cleanup_expired_registrations(cls):
        current_time = datetime.now()
        expired_keys = [key for key, exp_time in cls.pending_expirations.items() if exp_time < current_time]
        for key in expired_keys:
            cls.pending_registrations.pop(key, None)
            cls.pending_expirations.pop(key, None)
    
    def login(self, data):
        identifier = data.get('email') or data.get('phone')
        password = data['password']
        
        if not identifier:
            raise ValidationError(_("Vui lòng cung cấp email hoặc số điện thoại"))
        
        try:
            if '@' in identifier:
                user = User.objects.get(email=identifier, is_deleted=False)
            else:
                user = User.objects.get(phone=identifier, is_deleted=False)
        except User.DoesNotExist:
            raise ValidationError(_("Email/Số điện thoại hoặc mật khẩu không chính xác"))
        
        if user.check_password(password):
            tokens = JwtService.generate_token(user)
            return {'token': tokens['access']}
        
        raise ValidationError(_("Email/Số điện thoại hoặc mật khẩu không chính xác"))

    def send_reset_password_email(self, email):
        user = get_object_or_404(User, email=email, is_deleted=False)
        reset_token = ResetTokenService.generate_reset_token(user)
        
        send_mail(
            _('Đặt lại mật khẩu'),
            _('Mã đặt lại mật khẩu của bạn là: %(token)s') % {'token': reset_token},
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        
        return {'message': _('Email đặt lại mật khẩu đã được gửi')}
    
    def send_reset_password_otp(self, email):
        user = get_object_or_404(User, email=email, is_deleted=False)

        OtpService.send_otp_to_email(email)

        return {'message': _('Mã OTP đã được gửi đến email của bạn')}

    def resend_otp(self, email):
        self._cleanup_expired_registrations()

        if email not in self.pending_registrations:
            raise ValidationError(_("Không tìm thấy thông tin đăng ký hoặc đã hết hạn"))

        OtpService().send_otp_to_email(email)
        return _("Mã OTP đã được gửi lại đến email của bạn")
    
    @transaction.atomic
    def reset_password(self, data):
        reset_token = data['resetToken']
        new_password = data['password']
        
        user = ResetTokenService.validate_reset_token(reset_token)
        if not user:
            raise ValidationError(_("Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn"))
        
        user.set_password(new_password)
        user.save()
        
        ResetTokenService.remove_reset_token(reset_token)
        
        return {'message': _("Đặt lại mật khẩu thành công")}

class ResetTokenService:
    reset_tokens = {}  

    @staticmethod
    def generate_reset_token(user):
        import random
        token = ''.join(random.choices('0123456789', k=COMMON_LENGTH["RESET_TOKEN"]))
        
        ResetTokenService.reset_tokens[token] = {
            'user_id': user.id,
            'expires': datetime.now() + timedelta(minutes=10)
        }
        
        print(f"Generated reset token: {token} for user {user.id}")
        return token

    @staticmethod
    def validate_reset_token(token):
        current_time = datetime.now()
        expired_tokens = [t for t, data in ResetTokenService.reset_tokens.items() 
                            if data['expires'] < current_time]
        for expired_token in expired_tokens:
            ResetTokenService.reset_tokens.pop(expired_token, None)
        
        token_data = ResetTokenService.reset_tokens.get(token)
        if not token_data:
            return None
        
        try:
            return get_object_or_404(User, id=token_data['user_id'], is_deleted=False)
        except:
            ResetTokenService.reset_tokens.pop(token, None)
            return None

    @staticmethod
    def remove_reset_token(token):
        ResetTokenService.reset_tokens.pop(token, None)

class OtpService:
    otp_storage = {}  

    @staticmethod
    def generate_otp():
        import random
        return ''.join(random.choices('0123456789', k=6))

    @staticmethod
    def _cleanup_expired_otps():
        current_time = datetime.now()
        expired_keys = [key for key, data in OtpService.otp_storage.items() 
                        if data['expires'] < current_time]
        for key in expired_keys:
            OtpService.otp_storage.pop(key, None)

    @staticmethod
    def send_otp_to_email(email):
        OtpService._cleanup_expired_otps()
        otp = OtpService.generate_otp()
        
        send_mail(
            _('Xác nhận email'),
            _('Mã OTP của bạn là: %(otp)s. Mã này có hiệu lực trong 10 phút.') % {'otp': otp},
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=True,
        )
        
        OtpService.otp_storage[email] = {
            'otp': otp,
            'expires': datetime.now() + timedelta(minutes=10)
        }
        
        print(f"Sent OTP {otp} to {email}, expires at {OtpService.otp_storage[email]['expires']}")

    @staticmethod
    def validate_otp_by_email(email, user_input_otp):
        OtpService._cleanup_expired_otps()
        
        otp_data = OtpService.otp_storage.get(email)
        print(f"Validating OTP for email {email}: input={user_input_otp}, stored={otp_data}")
    
        if not otp_data:
            return {'resetToken': _('OTP đã hết hạn hoặc không tồn tại')}
    
        if otp_data['otp'] != user_input_otp:
            return {'resetToken': _('Mã OTP không đúng')}
    
        del OtpService.otp_storage[email]
        return {'resetToken': 'SUCCESS'}

class UserService:
    @transaction.atomic
    def get_all_users(self, page, size):
        from django.core.paginator import Paginator
        users = User.objects.filter(is_deleted=False).order_by('-created_at') 
        paginator = Paginator(users, size)
        page_obj = paginator.get_page(page + 1)  
        return {
            'content': [self.map_to_user_response(user) for user in page_obj.object_list],
            'page': page,
            'size': size,
            'totalElements': paginator.count,
            'totalPages': paginator.num_pages,
            'last': not page_obj.has_next()
        }

    @transaction.atomic
    def get_user_by_id(self, user_id):
        return self.map_to_user_response(get_object_or_404(User, id=user_id, is_deleted=False))

    @transaction.atomic
    def add_user(self, data):
        if data.get('phone') and User.objects.filter(phone=data['phone'], is_deleted=False).exists():
            raise ValidationError(_("Số điện thoại đã được sử dụng"))
        if data.get('email') and User.objects.filter(email=data['email'], is_deleted=False).exists():
            raise ValidationError(_("Email đã được sử dụng"))
        
        user = User.objects.create_user(
            email=data.get('email'),
            password=data['password'],
            phone=data.get('phone'),
            role=data['role']
        )
        return self.map_to_user_response(user)

    @transaction.atomic
    def edit_user(self, user_id, data):
        user = get_object_or_404(User, id=user_id, is_deleted=False)
        if data.get('email') and user.email != data['email'] and User.objects.filter(email=data['email'], is_deleted=False).exists():
            raise ValidationError(_("Email đã được sử dụng"))
        if data.get('phone') and user.phone != data['phone'] and User.objects.filter(phone=data['phone'], is_deleted=False).exists():
            raise ValidationError(_("Số điện thoại đã được sử dụng"))
        
        for key, value in data.items():
            if key == 'password' and value:
                user.set_password(value)
            elif value is not None and hasattr(user, key):
                setattr(user, key, value)
        user.save()
        return self.map_to_user_response(user)

    @transaction.atomic
    def delete_user(self, user_id):
        user = get_object_or_404(User, id=user_id, is_deleted=False)
        
        related_objects = []
        
        if hasattr(user, 'patient') and user.patient:
            related_objects.append(_("Bệnh nhân"))
        
        try:
            if hasattr(user, 'doctor') and user.doctor:
                related_objects.append(_("Bác sĩ"))
        except:
            pass
                
        if related_objects:
            raise ValidationError(
                _("Không thể xóa người dùng này vì còn liên kết với: %(objects)s. "
                    "Vui lòng xóa các liên kết này trước hoặc sử dụng force delete.") % {
                    'objects': ', '.join(related_objects)
                }
            )
        
        user.soft_delete()
        return {"message": _("Xóa người dùng thành công (soft delete)")}

    @transaction.atomic
    def force_delete_user(self, user_id):
        user = get_object_or_404(User, id=user_id)  
        
        if hasattr(user, 'patient') and user.patient:
            user.patient.delete()
        
        try:
            if hasattr(user, 'doctor') and user.doctor:
                user.doctor.delete()
        except:
            pass
                
        user.delete()  
        return {"message": _("Xóa người dùng và tất cả dữ liệu liên quan thành công (hard delete)")}

    @transaction.atomic
    def restore_user(self, user_id):
        user = get_object_or_404(User, id=user_id, is_deleted=True)
        user.restore()
        return {"message": _("Khôi phục người dùng thành công")}

    @transaction.atomic
    def change_password(self, user_id, data, current_user_role, current_user_id):
        user = get_object_or_404(User, id=user_id, is_deleted=False)
        
        is_admin = current_user_role == UserRole.ADMIN.value
        is_self = current_user_id == int(user_id)
        admin_reset = data.get('adminReset', False)
        
        if is_admin and admin_reset:
            pass
        elif is_self and not admin_reset:
            if not data.get('oldPassword'):
                raise ValidationError(_("Mật khẩu cũ không được để trống"))
            if not user.check_password(data['oldPassword']):
                raise ValidationError(_("Mật khẩu cũ không đúng"))
        elif is_admin and not is_self:
            pass
        else:
            raise ValidationError(_("Không có quyền thực hiện thao tác này"))
        
        user.set_password(data['newPassword'])
        user.save()

    def map_to_user_response(self, user):
        return {
            'userId': user.id,
            'email': user.email,
            'phone': user.phone,
            'role': user.role,
            'created_at': user.created_at
        }
