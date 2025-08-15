# notifications/services.py

from datetime import datetime
from .models import Notification, Token
from .firebase_config import initialize_firebase
from .fcm_utils import send_to_devices

# Đảm bảo Firebase được khởi tạo
initialize_firebase()

class NotificationService:
    @staticmethod
    def create(data: dict) -> Notification:
        tokens = TokenService.get_tokens_by_user_id(data['user'].id)

        firebase_response = send_to_devices(tokens, data['title'], data['message']) if tokens else None

        notification = Notification.objects.create(
            user=data['user'],
            title=data['title'],
            message=data['message'],
            type=data['type'],
            sent_at=datetime.now(),
            response=firebase_response.__dict__ if firebase_response else None
        )
        return notification

    @staticmethod
    def get_all_notifications():
        return Notification.objects.all().order_by('-sent_at') 


class TokenService:
    @staticmethod
    def get_tokens_by_user_id(user_id: int) -> list[str]:
        """
        Lấy danh sách token (FCM) theo ID người dùng
        """
        return list(Token.objects.filter(user_id=user_id).values_list('token', flat=True))

    @staticmethod
    def add_token(user, token_str: str) -> Token:
        """
        Lưu 1 token mới cho người dùng
        """
        return Token.objects.create(user=user, token=token_str)
    
    @staticmethod
    def get_all_tokens():
        return Token.objects.all().order_by('-id')
