from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext as _
from .models import User
from .serializers import (
    UserRequestSerializer, UserUpdateRequestSerializer, UserResponseSerializer,
    PagedResponseSerializer, ChangePasswordRequestSerializer, RegisterRequestSerializer,
    RegisterVerifyRequestSerializer, LoginFlexibleRequestSerializer, 
    ResetPasswordRequestSerializer, ForgotPasswordEmailRequestSerializer,
    ResendOtpRequestSerializer, VerifyOtpRequestSerializer
)
from .services import AuthService, UserService, OtpService, ResetTokenService
from common.enums import UserRole
from common.constants import PAGE_NO_DEFAULT, PAGE_SIZE_DEFAULT

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.ADMIN.value

class IsAdminOrDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [UserRole.ADMIN.value, UserRole.DOCTOR.value]

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (
            request.user.id == obj.id or 
            request.user.role == UserRole.ADMIN.value
        )

class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ['get_all_users', 'add_user']:
            permission_classes = [IsAdminUser] 
        elif self.action in ['retrieve', 'get_user_by_id']:
            permission_classes = [IsAdminOrDoctor]
        elif self.action in ['edit_user', 'delete_user', 'force_delete_user', 'change_password']:
            permission_classes = [IsOwnerOrAdmin] 
        else:
            permission_classes = [IsAuthenticated]  
        
        return [permission() for permission in permission_classes]

    def get_object(self, pk):
        return get_object_or_404(User, pk=pk)

    def retrieve(self, request, pk=None):
        user = get_object_or_404(User, pk=pk)
        return Response(UserResponseSerializer(user).data)

    @action(detail=False, methods=['get'], url_path='me')
    def get_current_user(self, request):
        return Response(UserResponseSerializer(request.user).data)

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_users(self, request):
        page = int(request.query_params.get('page', PAGE_NO_DEFAULT))
        size = int(request.query_params.get('size', PAGE_SIZE_DEFAULT))
        data = UserService().get_all_users(page, size)
        return Response(PagedResponseSerializer(data).data)

    @action(detail=True, methods=['get'])
    def get_user_by_id(self, request, pk=None):
        user = self.get_object(pk)
        return Response(UserResponseSerializer(user).data)

    @action(detail=False, methods=['get'], url_path='get_user_by_email')
    def get_user_by_email(self, request):
        email = request.query_params.get('email')
        if not email:
            return Response({"error": _("Email parameter is required")}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email, is_deleted=False)
            return Response({
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "role": user.role
            })
        except User.DoesNotExist:
            return Response({"error": _("User not found with this email")}, 
                            status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'], url_path='add')
    def add_user(self, request):
        serializer = UserRequestSerializer(data=request.data)
        if serializer.is_valid():
            user_data = UserService().add_user(serializer.validated_data)
            return Response(user_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['put'])
    def edit_user(self, request, pk=None):
        user = self.get_object(pk)
        if request.user.id != int(pk) and request.user.role != UserRole.ADMIN.value:
            return Response({"error": _("Bạn không có quyền sửa thông tin user này")}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        if 'role' in request.data and request.user.role != UserRole.ADMIN.value:
            return Response({"error": _("Chỉ Admin mới có quyền thay đổi vai trò người dùng")}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserUpdateRequestSerializer(data=request.data)
        if serializer.is_valid():
            user_data = UserService().edit_user(pk, serializer.validated_data)
            return Response(user_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """
        PATCH method để cập nhật một số trường cụ thể của User
        Hỗ trợ cập nhật phone, email, etc.
        """
        user = self.get_object(pk)
        if request.user.id != int(pk) and request.user.role != UserRole.ADMIN.value:
            return Response({"error": _("Bạn không có quyền sửa thông tin user này")}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        # Chỉ cho phép cập nhật một số trường nhất định
        allowed_fields = ['phone', 'email']
        update_data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        if not update_data:
            return Response({"error": _("Không có trường nào được phép cập nhật")}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserUpdateRequestSerializer(user, data=update_data, partial=True)
        if serializer.is_valid():
            user_data = UserService().edit_user(pk, serializer.validated_data)
            return Response(user_data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'])
    def delete_user(self, request, pk=None):
        if request.user.role != UserRole.ADMIN.value:
            return Response({"error": _("Chỉ Admin mới có quyền xóa user")}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        try:
            result = UserService().delete_user(pk)
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='force-delete')
    def force_delete_user(self, request, pk=None):
        if request.user.role != UserRole.ADMIN.value:
            return Response({"error": _("Chỉ Admin mới có quyền force delete user")}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        result = UserService().force_delete_user(pk)
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'], url_path='change-password')
    def change_password(self, request, pk=None):
        if request.user.id != int(pk) and request.user.role != UserRole.ADMIN.value:
            return Response({"error": _("Bạn không có quyền đổi mật khẩu của user này")}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        serializer = ChangePasswordRequestSerializer(data=request.data)
        if serializer.is_valid():
            UserService().change_password(
                pk, 
                serializer.validated_data, 
                request.user.role, 
                request.user.id
            )
            return Response({"message": _("Đổi mật khẩu thành công")}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AuthViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = RegisterRequestSerializer(data=request.data)
        if serializer.is_valid():
            message = AuthService().pre_register(serializer.validated_data)
            email = request.data.get('email')
            return Response({"message": _("OTP đã được gửi tới %(email)s") % {'email': email}}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='register/verify')
    def verify_registration(self, request):
        serializer = RegisterVerifyRequestSerializer(data=request.data)
        if serializer.is_valid():
            user = AuthService().complete_registration(serializer.validated_data)
            return Response({"id": user['id'], "role": user['role']}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='login')
    def login_flexible(self, request):
        serializer = LoginFlexibleRequestSerializer(data=request.data)
        if serializer.is_valid():
            response = AuthService().login(serializer.validated_data)
            return Response(response)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='forgot-password')
    def forgot_password_email(self, request):
        serializer = ForgotPasswordEmailRequestSerializer(data=request.data)
        if serializer.is_valid():
            response = AuthService().send_reset_password_otp(serializer.validated_data['email'])
            return Response(response)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put'], url_path='reset-password')
    def reset_password(self, request):
        serializer = ResetPasswordRequestSerializer(data=request.data)
        if serializer.is_valid():
            response = AuthService().reset_password(serializer.validated_data)
            return Response(response)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='register/resend-otp')
    def resend_otp(self, request):
        serializer = ResendOtpRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                message = AuthService().resend_otp(email)
                return Response({"message": _("OTP đã được gửi lại tới %(email)s") % {'email': email}}, 
                                status=status.HTTP_200_OK)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='verify-otp')
    def verify_otp(self, request):
        serializer = VerifyOtpRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            try:
                otp_response = OtpService.validate_otp_by_email(email, otp)
                if otp_response.get('resetToken') != 'SUCCESS':
                    return Response({"error": otp_response.get('resetToken')}, status=status.HTTP_400_BAD_REQUEST)

                user = get_object_or_404(User, email=email, is_deleted=False)
                reset_token = ResetTokenService.generate_reset_token(user)

                return Response({
                    "message": _("Xác minh OTP thành công"), 
                    "resetToken": reset_token
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({"error": _("Có lỗi xảy ra, vui lòng thử lại")}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
