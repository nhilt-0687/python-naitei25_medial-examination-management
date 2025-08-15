from django.utils.translation import gettext_lazy as _
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        custom_response = response.data
        if isinstance(exc, ValueError):
            custom_response = {"error": str(exc)}
            return Response(custom_response, status=status.HTTP_400_BAD_REQUEST)
        elif isinstance(exc, Http404):
            custom_response = {"error": _("Không tìm thấy hóa đơn")}
            return Response(custom_response, status=status.HTTP_404_NOT_FOUND)
    return response
