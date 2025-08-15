from django.db import models
from core.models import BaseModel
from users.models import User
from common.enums import NotificationType
from common.constants import COMMON_LENGTH, ENUM_LENGTH

class Notification(BaseModel):
    user = models.ForeignKey(User, on_delete=models.RESTRICT)
    title = models.CharField(max_length=COMMON_LENGTH["TITLE"])
    message = models.TextField()
    type = models.CharField(max_length=ENUM_LENGTH["DEFAULT"], choices=[(n.value, n.name) for n in NotificationType])
    sent_at = models.DateTimeField(blank=True, null=True)
    response = models.JSONField(blank=True, null=True)  
    created_at = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return self.title


class Token(BaseModel):
    user = models.ForeignKey(User, on_delete=models.RESTRICT)
    token = models.CharField(max_length=COMMON_LENGTH["TOKEN"])

    def __str__(self):
        return f"Token {self.pk}"

