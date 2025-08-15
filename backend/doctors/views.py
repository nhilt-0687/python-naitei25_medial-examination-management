import logging
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, permission_classes as drf_permission_classes
from rest_framework.parsers import MultiPartParser
from django.http import Http404
from django.utils.dateparse import parse_date
from .models import Doctor, Department, ExaminationRoom, Schedule
from .serializers import DoctorSerializer, DoctorPartialUpdateSerializer, CreateDoctorRequestSerializer, DepartmentSerializer, ExaminationRoomSerializer, ScheduleSerializer, DoctorUpdateSerializer
from .services import DoctorService, DepartmentService, ExaminationRoomService, ScheduleService

logger = logging.getLogger(__name__)

class DoctorViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search', 'filter', 'get_doctor_by_user_id']:
            return [AllowAny()]
        return super().get_permissions()

    def get_object(self, pk):
        try:
            return Doctor.objects.get(pk=pk)
        except Doctor.DoesNotExist:
            raise Http404

    @drf_permission_classes((AllowAny,))
    def list(self, request):
        doctors = DoctorService().get_all_doctors()
        serializer = DoctorSerializer(doctors, many=True)
        return Response(serializer.data)

    @drf_permission_classes((AllowAny,))
    def retrieve(self, request, pk=None):
        doctor = self.get_object(pk)
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

    def create(self, request):
        serializer = CreateDoctorRequestSerializer(data=request.data)
        if serializer.is_valid():
            doctor = DoctorService().create_doctor(serializer.validated_data)
            return Response(DoctorSerializer(doctor).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        doctor = self.get_object(pk)
        serializer = DoctorSerializer(doctor, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """
        PATCH method để cập nhật một số trường cụ thể
        Hỗ trợ cập nhật cả thông tin doctor và user liên quan
        """
        doctor = self.get_object(pk)
        
        # Sử dụng DoctorUpdateSerializer mới để xử lý cả doctor và user fields
        serializer = DoctorUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            try:
                from django.db import transaction
                
                with transaction.atomic():
                    # Tách data cho doctor và user
                    doctor_data = {}
                    user_data = {}
                    
                    # Map các fields từ serializer sang model fields
                    field_mapping = {
                        'first_name': 'first_name',
                        'last_name': 'last_name', 
                        'identity_number': 'identity_number',
                        'birthday': 'birthday',
                        'gender': 'gender',
                        'address': 'address',
                        'academic_degree': 'academic_degree',
                        'specialization': 'specialization',
                        'type': 'type',
                        'department_id': 'department_id',
                        'price': 'price',
                        'avatar': 'avatar'
                    }
                    
                    # Tách data cho doctor
                    for serializer_field, model_field in field_mapping.items():
                        if serializer_field in serializer.validated_data:
                            doctor_data[model_field] = serializer.validated_data[serializer_field]
                    
                    # Tách data cho user
                    if 'email' in serializer.validated_data:
                        user_data['email'] = serializer.validated_data['email']
                    if 'phone' in serializer.validated_data:
                        user_data['phone'] = serializer.validated_data['phone']
                    
                    # Validation: Kiểm tra unique constraint cho email và phone
                    if user_data:
                        from users.models import User
                        
                        # Kiểm tra email unique (nếu có thay đổi)
                        if 'email' in user_data and user_data['email']:
                            existing_user = User.objects.filter(
                                email=user_data['email'], 
                                is_deleted=False
                            ).exclude(id=doctor.user.id).first()
                            if existing_user:
                                return Response(
                                    {"error": f"Email {user_data['email']} đã được sử dụng bởi người dùng khác"}, 
                                    status=status.HTTP_400_BAD_REQUEST
                                )
                        
                        # Kiểm tra phone unique (nếu có thay đổi)
                        if 'phone' in user_data and user_data['phone']:
                            existing_user = User.objects.filter(
                                phone=user_data['phone'], 
                                is_deleted=False
                            ).exclude(id=doctor.user.id).first()
                            if existing_user:
                                return Response(
                                    {"error": f"Số điện thoại {user_data['phone']} đã được sử dụng bởi người dùng khác"}, 
                                    status=status.HTTP_400_BAD_REQUEST
                                )
                        
                        # Validation: Đảm bảo ít nhất một trong hai trường email hoặc phone phải có giá trị
                        final_email = user_data.get('email', doctor.user.email)
                        final_phone = user_data.get('phone', doctor.user.phone)
                        
                        if not final_email and not final_phone:
                            return Response(
                                {"error": "Ít nhất một trong hai trường email hoặc số điện thoại phải có giá trị"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra department_id nếu có thay đổi
                    if 'department_id' in doctor_data:
                        try:
                            department = Department.objects.get(pk=doctor_data['department_id'])
                        except Department.DoesNotExist:
                            return Response(
                                {"error": f"Khoa với ID {doctor_data['department_id']} không tồn tại"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra identity_number unique (nếu có thay đổi)
                    if 'identity_number' in doctor_data:
                        existing_doctor = Doctor.objects.filter(
                            identity_number=doctor_data['identity_number']
                        ).exclude(id=doctor.id).first()
                        if existing_doctor:
                            return Response(
                                {"error": f"Số CMND/CCCD {doctor_data['identity_number']} đã được sử dụng bởi bác sĩ khác"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra price không âm (nếu có thay đổi)
                    if 'price' in doctor_data and doctor_data['price'] is not None:
                        if doctor_data['price'] < 0:
                            return Response(
                                {"error": "Phí khám không được âm"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra birthday không phải ngày trong tương lai (nếu có thay đổi)
                    if 'birthday' in doctor_data:
                        from django.utils import timezone
                        if doctor_data['birthday'] > timezone.now().date():
                            return Response(
                                {"error": "Ngày sinh không thể là ngày trong tương lai"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra first_name và last_name không bị để trống
                    if 'first_name' in doctor_data and not doctor_data['first_name'].strip():
                        return Response(
                            {"error": "Tên không được để trống"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    if 'last_name' in doctor_data and not doctor_data['last_name'].strip():
                        return Response(
                            {"error": "Họ không được để trống"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra specialization không bị để trống
                    if 'specialization' in doctor_data and not doctor_data['specialization'].strip():
                        return Response(
                            {"error": "Chuyên môn không được để trống"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra address không bị để trống nếu được cung cấp
                    if 'address' in doctor_data and doctor_data['address'] is not None and not doctor_data['address'].strip():
                        return Response(
                            {"error": "Địa chỉ không được để trống"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra email format nếu được cung cấp
                    if 'email' in user_data and user_data['email']:
                        import re
                        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                        if not re.match(email_pattern, user_data['email']):
                            return Response(
                                {"error": "Email không có format hợp lệ"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra phone format nếu được cung cấp
                    if 'phone' in user_data and user_data['phone']:
                        import re
                        phone_pattern = r'^[0-9]{10,11}$'
                        if not re.match(phone_pattern, user_data['phone']):
                            return Response(
                                {"error": "Số điện thoại phải có 10-11 chữ số"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra identity_number format nếu được cung cấp
                    if 'identity_number' in doctor_data:
                        import re
                        identity_pattern = r'^[0-9]{9,12}$'
                        if not re.match(identity_pattern, doctor_data['identity_number']):
                            return Response(
                                {"error": "Số CMND/CCCD phải có 9-12 chữ số"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra price không quá lớn
                    if 'price' in doctor_data and doctor_data['price'] is not None:
                        if doctor_data['price'] > 999999999.99:  # Giới hạn 999,999,999.99 VNĐ
                            return Response(
                                {"error": "Phí khám không được vượt quá 999,999,999.99 VNĐ"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra birthday không quá sớm
                    if 'birthday' in doctor_data:
                        from datetime import date
                        min_birthday = date(1900, 1, 1)
                        if doctor_data['birthday'] < min_birthday:
                            return Response(
                                {"error": "Ngày sinh không thể trước năm 1900"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Validation: Kiểm tra first_name và last_name không quá dài
                    if 'first_name' in doctor_data and len(doctor_data['first_name']) > 50:
                        return Response(
                            {"error": "Tên không được vượt quá 50 ký tự"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    if 'last_name' in doctor_data and len(doctor_data['last_name']) > 50:
                        return Response(
                            {"error": "Họ không được vượt quá 50 ký tự"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra specialization không quá dài
                    if 'specialization' in doctor_data and len(doctor_data['specialization']) > 200:
                        return Response(
                            {"error": "Chuyên môn không được vượt quá 200 ký tự"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra address không quá dài
                    if 'address' in doctor_data and doctor_data['address'] and len(doctor_data['address']) > 500:
                        return Response(
                            {"error": "Địa chỉ không được vượt quá 500 ký tự"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra email không quá dài
                    if 'email' in user_data and user_data['email'] and len(user_data['email']) > 254:
                        return Response(
                            {"error": "Email không được vượt quá 254 ký tự"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra phone không quá dài
                    if 'phone' in user_data and user_data['phone'] and len(user_data['phone']) > 15:
                        return Response(
                            {"error": "Số điện thoại không được vượt quá 15 ký tự"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra identity_number không quá dài
                    if 'identity_number' in doctor_data and len(doctor_data['identity_number']) > 20:
                        return Response(
                            {"error": "Số CMND/CCCD không được vượt quá 20 ký tự"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra avatar không quá dài
                    if 'avatar' in doctor_data and doctor_data['avatar'] and len(doctor_data['avatar']) > 500:
                        return Response(
                            {"error": "Đường dẫn avatar không được vượt quá 500 ký tự"}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Validation: Kiểm tra price có đúng số chữ số thập phân
                    if 'price' in doctor_data and doctor_data['price'] is not None:
                        price_str = str(doctor_data['price'])
                        if '.' in price_str:
                            decimal_part = price_str.split('.')[1]
                            if len(decimal_part) > 2:
                                return Response(
                                    {"error": "Phí khám chỉ được có tối đa 2 chữ số thập phân"}, 
                                    status=status.HTTP_400_BAD_REQUEST
                                )
                        
                        # Kiểm tra số chữ số nguyên
                        integer_part = price_str.split('.')[0] if '.' in price_str else price_str
                        if len(integer_part) > 9:
                            return Response(
                                {"error": "Phí khám chỉ được có tối đa 9 chữ số nguyên"}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                    
                    # Cập nhật doctor nếu có data
                    if doctor_data:
                        logger.info(f"Updating doctor {pk} with data: {doctor_data}")
                        for field, value in doctor_data.items():
                            setattr(doctor, field, value)
                        doctor.save()
                    
                    # Cập nhật user nếu có data
                    if user_data and doctor.user:
                        logger.info(f"Updating user {doctor.user.id} with data: {user_data}")
                        for field, value in user_data.items():
                            setattr(doctor.user, field, value)
                        doctor.user.save()
                    
                    # Trả về doctor đã được cập nhật
                    updated_doctor = DoctorSerializer(doctor).data
                    logger.info(f"Successfully updated doctor {pk}")
                    return Response(updated_doctor)
                
            except Exception as e:
                logger.error(f"Error updating doctor {pk}: {str(e)}")
                return Response(
                    {"error": "Có lỗi xảy ra khi cập nhật thông tin bác sĩ"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        DoctorService().delete_doctor(pk)
        return Response({"message": "Bác sĩ được xóa thành công"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser])
    def upload_avatar(self, request, pk=None):
        file = request.FILES.get('file')
        doctor = self.get_object(pk)
        updated_doctor = DoctorService().upload_avatar(doctor, file)
        return Response(DoctorSerializer(updated_doctor).data)

    @action(detail=True, methods=['delete'])
    def delete_avatar(self, request, pk=None):
        doctor = self.get_object(pk)
        updated_doctor = DoctorService().delete_avatar(doctor)
        return Response(DoctorSerializer(updated_doctor).data)

    @drf_permission_classes((AllowAny,))
    @action(detail=False, methods=['get'])
    def search(self, request):
        identity_number = request.query_params.get('identityNumber')
        doctor = DoctorService().find_by_identity_number(identity_number)
        return Response(DoctorSerializer(doctor).data if doctor else None)

    @drf_permission_classes((AllowAny,))
    @action(detail=False, methods=['get'])
    def filter(self, request):
        gender = request.query_params.get('gender')
        academic_degree = request.query_params.get('academicDegree')
        specialization = request.query_params.get('specialization')
        type = request.query_params.get('type')
        doctors = DoctorService().filter_doctors(gender, academic_degree, specialization, type)
        return Response(DoctorSerializer(doctors, many=True).data)

    @drf_permission_classes((AllowAny,))
    @action(detail=False, methods=['get'], url_path='user/(?P<user_id>\d+)')
    def get_doctor_by_user_id(self, request, user_id=None):
        doctor = DoctorService().get_doctor_by_user_id(user_id)
        return Response(DoctorSerializer(doctor).data if doctor else None)

class DepartmentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Department.objects.get(pk=pk)
        except Department.DoesNotExist:
            raise Http404
        
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'doctors']:
            return [AllowAny()]
        return super().get_permissions()

    @drf_permission_classes((AllowAny,))
    def list(self, request):
        departments = DepartmentService().get_all_departments()
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)

    @drf_permission_classes((AllowAny,))
    def retrieve(self, request, pk=None):
        department = self.get_object(pk)
        serializer = DepartmentSerializer(department)
        return Response(serializer.data)

    def create(self, request):
        serializer = DepartmentSerializer(data=request.data)
        if serializer.is_valid():
            department = DepartmentService().create_department(serializer.validated_data)
            return Response(DepartmentSerializer(department).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        department = self.get_object(pk)
        serializer = DepartmentSerializer(department, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        DepartmentService().delete_department(pk)
        return Response({"message": "Khoa được xóa thành công"}, status=status.HTTP_200_OK)

    @drf_permission_classes((AllowAny,))
    @action(detail=True, methods=['get'])
    def doctors(self, request, pk=None):
        doctors = DepartmentService().get_doctors_by_department_id(pk)
        return Response(DoctorSerializer(doctors, many=True).data)
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser])
    def upload_avatar(self, request, pk=None):
        file = request.FILES.get('file')
        department = self.get_object(pk)
        updated_department = DepartmentService().upload_avatar(department, file)
        return Response(DepartmentSerializer(updated_department).data)

    @action(detail=True, methods=['delete'])
    def delete_avatar(self, request, pk=None):
        department = self.get_object(pk)
        updated_department = DepartmentService().delete_avatar(department)
        return Response(DepartmentSerializer(updated_department).data)

class ExaminationRoomViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return ExaminationRoom.objects.get(pk=pk)
        except ExaminationRoom.DoesNotExist:
            raise Http404

    def list(self, request):
        rooms = ExaminationRoomService().get_all_examination_rooms()
        serializer = ExaminationRoomSerializer(rooms, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        room = self.get_object(pk)
        serializer = ExaminationRoomSerializer(room)
        return Response(serializer.data)

    def create(self, request):
        serializer = ExaminationRoomSerializer(data=request.data)
        if serializer.is_valid():
            room = ExaminationRoomService().create_examination_room(serializer.validated_data)
            return Response(ExaminationRoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        room = self.get_object(pk)
        serializer = ExaminationRoomSerializer(room, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        ExaminationRoomService().delete_examination_room(pk)
        return Response({"message": "Phòng được xóa thành công"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def search(self, request):
        type = request.query_params.get('type')
        building = request.query_params.get('building')
        floor = request.query_params.get('floor')
        rooms = ExaminationRoomService().filter_rooms(type, building, floor)
        return Response(ExaminationRoomSerializer(rooms, many=True).data)

class ScheduleViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Schedule.objects.get(pk=pk)
        except Schedule.DoesNotExist:
            raise Http404

    def list(self, request, doctor_id=None):
        shift = request.query_params.get('shift')
        work_date = request.query_params.get('workDate')
        room_id = request.query_params.get('roomId')
        doctor_id = request.query_params.get('doctor_id') # Lấy doctor_id từ query params
        schedules = ScheduleService().get_all_schedules(doctor_id, shift, work_date, room_id)
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        schedule = self.get_object(pk)
        serializer = ScheduleSerializer(schedule)
        return Response(serializer.data)

    def create(self, request, doctor_id=None):
        # Không ép phải có doctor_id nếu đã có doctor trong body
        serializer = ScheduleSerializer(data=request.data)
        if serializer.is_valid():
            # Nếu doctor_id trên URL, ưu tiên truyền vào service, nếu không thì None
            schedule = ScheduleService().create_schedule(doctor_id, serializer.validated_data)
            return Response(ScheduleSerializer(schedule).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, doctor_id=None, pk=None):
        schedule = self.get_object(pk)
        if doctor_id is None:
            doctor_id = request.data.get('doctor_id', schedule.doctor_id)

        serializer = ScheduleSerializer(schedule, data=request.data, partial=True)
        if serializer.is_valid():
            schedule = ScheduleService().update_schedule(doctor_id, pk, serializer.validated_data)
            return Response(ScheduleSerializer(schedule).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, doctor_id=None, pk=None):
        schedule = self.get_object(pk)
        if doctor_id is None:
            doctor_id = schedule.doctor_id

        ScheduleService().delete_schedule(doctor_id, pk)
        return Response({"message": "Lịch được xóa thành công"}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def admin(self, request):
        schedules = ScheduleService().get_all_schedules_for_admin()
        return Response(ScheduleSerializer(schedules, many=True).data)

    @action(detail=False, methods=['post'])
    def batch(self, request):
        schedule_ids = request.data.get('scheduleIds', [])
        schedules = ScheduleService().get_schedules_by_ids(schedule_ids)
        return Response(ScheduleSerializer(schedules, many=True).data)

    @action(detail=False, methods=['get'], url_path='date/(?P<date>[^/.]+)')
    def get_by_date(self, request, date=None):
        if not date:
            return Response({"message": "Ngày không được để trống."}, status=status.HTTP_400_BAD_REQUEST)

        parsed_date = parse_date(date)
        if not parsed_date:
            return Response({"message": "Định dạng ngày không hợp lệ. YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        doctor_id = request.query_params.get('doctor_id')

        schedules = ScheduleService().get_all_schedules(
            doctor_id=doctor_id,
            shift=None,
            work_date=parsed_date,
            room_id=None
        )
        serializer = ScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
