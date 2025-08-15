from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404

User = get_user_model()

class EmailPhoneBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get('email') or kwargs.get('phone')
        
        if username is None or password is None:
            return None
        
        try:
            if '@' in username:
                user = User.objects.get(email=username)
            else:
                user = User.objects.get(phone=username)
        except User.DoesNotExist:
            User().set_password(password)
            return None
        except User.MultipleObjectsReturned:
            return None
        
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
    
    def user_can_authenticate(self, user):
        return getattr(user, 'is_active', None) and not getattr(user, 'is_deleted', False)
    
    def get_user(self, user_id):
        return get_object_or_404(User, pk=user_id, is_deleted=False)
