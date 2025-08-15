from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django.http import Http404
from django.utils.translation import gettext_lazy as _
from django.shortcuts import get_object_or_404
from .models import Bill, BillDetail, Transaction
from .serializers import NewBillRequestSerializer, UpdateBillRequestSerializer, BillResponseSerializer, NewBillDetailRequestSerializer, BillDetailResponseSerializer, TransactionDTOSerializer
from .services import BillService, PayOSService, TransactionService
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination

class BillViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def list(self, request):
        page = request.query_params.get('page', 1)
        size = request.query_params.get('size', 10)
        sort_by = request.query_params.get('sort_by', 'created_at')
        sort_order = request.query_params.get('sort_order', 'desc')
        try:
            bills = BillService().get_all_bills(int(page), int(size), sort_by=sort_by, sort_order=sort_order)
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(bills, request)
            serializer = BillResponseSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except ValueError as e:
            raise ValidationError({"error": str(e)})

    def create(self, request):
        serializer = NewBillRequestSerializer(data=request.data)
        if serializer.is_valid():
            bill = BillService().create_bill(serializer.validated_data)
            return Response(BillResponseSerializer(bill).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        try:
            bill = BillService().get_bill_by_id(pk)
            return Response(BillResponseSerializer(bill).data)
        except Http404:
            return Response({"error": _("Không tìm thấy hóa đơn")}, status=status.HTTP_404_NOT_FOUND)

    def update(self, request, pk=None):
        serializer = UpdateBillRequestSerializer(data=request.data)
        if serializer.is_valid():
            try:
                bill = BillService().update_bill(pk, serializer.validated_data)
                return Response(BillResponseSerializer(bill).data)
            except Http404:
                return Response({"error": _("Không tìm thấy hóa đơn")}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            BillService().delete_bill(pk)
            return Response({"message": _("Xóa hóa đơn thành công")}, status=status.HTTP_200_OK)
        except Http404:
            return Response({"error": _("Không tìm thấy hóa đơn")}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], url_path='details')
    def create_bill_details(self, request, pk=None):
        serializer = NewBillDetailRequestSerializer(data=request.data, many=True)
        if serializer.is_valid():
            try:
                bill = BillService().create_bill_detail(pk, serializer.validated_data)
                return Response(BillResponseSerializer(bill).data, status=status.HTTP_201_CREATED)
            except Http404:
                return Response({"error": _("Không tìm thấy hóa đơn")}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='list-details')
    def get_bill_details(self, request, pk=None):
        try:
            details = BillService().get_detail_by_bill(pk)
            serializer = BillDetailResponseSerializer(details, many=True)
            return Response(serializer.data)
        except Http404:
            return Response({"error": _("Không tìm thấy hóa đơn")}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path=r'patient/(?P<patient_id>\d+)')
    def get_bills_by_patient_id(self, request, patient_id=None):
        bills = BillService().get_bills_by_patient_id(patient_id)
        serializer = BillResponseSerializer(bills, many=True)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path=r'create-payment/(?P<bill_id>\d+)')
    def create_payment(self, request, bill_id=None):
        try:
            payment_url = TransactionService().create_payment_link(bill_id)
            response = {"error": 0, "message": _("Thành công"), "data": payment_url}
            return Response(response)
        except Exception as e:
            return Response({"error": -1, "message": str(e), "data": None}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path=r'cash-payment/(?P<bill_id>\d+)')
    def process_cash_payment(self, request, bill_id=None):
        try:
            TransactionService().process_cash_payment(bill_id)
            response = {"error": 0, "message": _("Thanh toán tiền mặt thành công"), "data": None}
            return Response(response)
        except Exception as e:
            return Response({"error": -1, "message": str(e), "data": None}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='webhook', permission_classes=[])
    def handle_payment_webhook(self, request):
        try:
            PayOSService().handle_payment_callback(request.data)
            response = {"error": 0, "message": _("Webhook được xử lý thành công"), "data": None}
            return Response(response)
        except Exception as e:
            return Response({"error": -1, "message": str(e), "data": None}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path=r'payment-info/(?P<order_id>\d+)')
    def get_payment_info(self, request, order_id=None):
        try:
            payment_info = PayOSService().get_payment_info(order_id)
            response = {"error": 0, "message": _("Thành công"), "data": payment_info}
            return Response(response)
        except Exception as e:
            return Response({"error": -1, "message": str(e), "data": None}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put'], url_path=r'cancel-payment/(?P<order_id>\d+)')
    def cancel_payment(self, request, order_id=None):
        try:
            cancel_result = PayOSService().cancel_payment(order_id)
            response = {"error": 0, "message": _("Đã hủy thanh toán"), "data": cancel_result}
            return Response(response)
        except Exception as e:
            return Response({"error": -1, "message": str(e), "data": None}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'post'], url_path=r'(?P<order_id>\d+)/success')
    def handle_payment_success(self, request, order_id=None):
        try:
            TransactionService().handle_payment_success(order_id)
            response = {"error": 0, "message": _("Thanh toán thành công"), "status": "success", "order_id": order_id}
            return Response(response)
        except Exception as e:
            return Response({"error": -1, "message": str(e), "status": "error", "order_id": order_id}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'post'], url_path=r'(?P<order_id>\d+)/cancel')
    def handle_payment_cancel(self, request, order_id=None):
        try:
            TransactionService().handle_payment_cancel(order_id)
            response = {"error": 0, "message": _("Đã hủy thanh toán"), "status": "cancel", "order_id": order_id}
            return Response(response)
        except Exception as e:
            return Response({"error": -1, "message": str(e), "status": "error", "order_id": order_id}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path=r'bill/(?P<bill_id>\d+)')
    def get_transactions_by_bill_id(self, request, bill_id=None):
        try:
            sort_by = request.query_params.get('sort_by', 'transaction_date')
            sort_order = request.query_params.get('sort_order', 'desc')
            transactions = TransactionService().get_transactions_by_bill_id(
                bill_id, sort_by=sort_by, sort_order=sort_order
            )
            response = {"error": 0, "message": _("Thành công"), "data": transactions}
            return Response(response)
        except Http404:
            return Response({"error": -1, "message": _("Không tìm thấy hóa đơn"), "data": None}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": -1, "message": str(e), "data": None}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": -1, "message": _("Lỗi không xác định: {error}").format(error=str(e)), "data": None}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
