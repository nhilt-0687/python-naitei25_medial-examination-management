# notifications/fcm_utils.py

from firebase_admin import messaging

def send_to_devices(tokens: list[str], title: str, body: str):
    """
    Gửi notification đến danh sách thiết bị (FCM tokens) bằng MulticastMessage.
    """
    if not tokens:
        return None  # không gửi nếu không có token

    message = messaging.MulticastMessage(
        notification=messaging.Notification(title=title, body=body),
        tokens=tokens,
    )
    try:
        response = messaging.send_multicast(message)
        return response  # là một đối tượng SendResponse
    except Exception as e:
        print("Firebase send error:", e)
        raise
