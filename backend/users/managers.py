from django.db import models
from django.utils.translation import gettext_lazy as _

class ActiveUserManager(models.Manager):    
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
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

class AllUserManager(models.Manager):    
    def get_queryset(self):
        return super().get_queryset()
