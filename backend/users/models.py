from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from core.models import BaseModel
from common.enums import UserRole
from common.constants import USER_LENGTH, ENUM_LENGTH, REGEX_PATTERNS

class UserManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_with_deleted(self):
        return super().get_queryset()
    
    def create_user(self, email=None, password=None, phone=None, **extra_fields):
        if not email and not phone:
            raise ValueError(_('Email hoặc số điện thoại là bắt buộc'))
        
        if email:
            email = self.normalize_email(email)
        
        user = self.model(email=email, phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        user.save(using=self._db)
        return user
    
    def normalize_email(self, email):
        if email:
            return email.lower().strip()
        return email
    def get_by_natural_key(self, username):
        return self.get(email=username)

class User(BaseModel):
    email = models.EmailField(max_length=USER_LENGTH["EMAIL"], unique=True, null=True, blank=True)
    password = models.CharField(max_length=USER_LENGTH["PASSWORD"])
    phone = models.CharField(
        max_length=USER_LENGTH["PHONE"], 
        blank=True, 
        null=True, 
        unique=True,
        validators=[RegexValidator(REGEX_PATTERNS["PHONE"], message=_("Số điện thoại không hợp lệ"))]
    )
    role = models.CharField(
        max_length=ENUM_LENGTH["DEFAULT"], 
        choices=[(r.value, r.name) for r in UserRole],
        default=UserRole.PATIENT.value
    )
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False, db_index=True) 
    deleted_at = models.DateTimeField(null=True, blank=True)  
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    def set_password(self, raw_password):
        if raw_password:
            self.password = make_password(raw_password)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password)
    
    def has_perm(self, perm, obj=None):
        return True
    
    def has_module_perms(self, app_label):
        return True
    
    @property
    def is_staff(self):
        return self.role in [UserRole.ADMIN.value, UserRole.DOCTOR.value]
    
    @property
    def is_superuser(self):
        return self.role == UserRole.ADMIN.value
    
    @property
    def is_anonymous(self):
        return False
    
    @property
    def is_authenticated(self):
        return True
    
    @property
    def username(self):
        return self.email or self.phone
    
    def get_username(self):
        return self.username
    
    def natural_key(self):
        return (self.username,)
    
    def soft_delete(self):
        from django.utils import timezone
        self.is_deleted = True
        self.is_active = False
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        self.is_deleted = False
        self.is_active = True
        self.deleted_at = None
        self.save()
    
    def __str__(self):
        return self.email or self.phone or f"User {self.id}"

    class Meta:
        indexes = [
            models.Index(fields=['is_deleted']),
            models.Index(fields=['deleted_at']),
            models.Index(fields=['email', 'is_deleted']),
            models.Index(fields=['phone', 'is_deleted']),
        ]
