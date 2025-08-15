from rest_framework import serializers
from .models import Bill, BillDetail, Transaction
from common.enums import PaymentStatus, ServiceType
from common.constants import PAYMENT_LENGTH, DECIMAL_MAX_DIGITS, DECIMAL_DECIMAL_PLACES, COMMON_LENGTH

class TransactionDTOSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'bill_id', 'amount', 'payment_method', 'transaction_date', 'status', 'created_at', 'updated_at']

class NewBillDetailRequestSerializer(serializers.Serializer):
    item_type = serializers.ChoiceField(choices=[(i.value, i.name) for i in ServiceType])
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)
    insurance_discount = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES, allow_null=True)

class NewBillRequestSerializer(serializers.Serializer):
    appointment_id = serializers.IntegerField()
    patient_id = serializers.IntegerField()
    total_cost = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)
    insurance_discount = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES, allow_null=True)
    amount = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)
    status = serializers.ChoiceField(choices=[(s.value, s.name) for s in PaymentStatus])
    bill_details = NewBillDetailRequestSerializer(many=True)

class UpdateBillRequestSerializer(serializers.Serializer):
    appointment_id = serializers.IntegerField(required=False)
    status = serializers.ChoiceField(choices=[(s.value, s.name) for s in PaymentStatus], required=False)

class BillDetailResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillDetail
        fields = ['id', 'bill_id', 'item_type', 'quantity', 'unit_price', 'total_price', 'insurance_discount', 'created_at', 'updated_at']

class BillResponseSerializer(serializers.ModelSerializer):
    bill_details = BillDetailResponseSerializer(many=True, read_only=True)
    appointment = serializers.PrimaryKeyRelatedField(read_only=True)
    patient = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Bill
        fields = ['id', 'appointment', 'patient', 'total_cost', 'insurance_discount', 'amount', 'status', 'created_at', 'updated_at', 'bill_details']

class CreatePaymentRequestSerializer(serializers.Serializer):
    product_name = serializers.CharField(max_length=COMMON_LENGTH["NAME"])
    description = serializers.CharField(max_length=COMMON_LENGTH["NOTE"])
    return_url = serializers.URLField(max_length=COMMON_LENGTH["URL"])
    cancel_url = serializers.URLField(max_length=COMMON_LENGTH["URL"])
    price = serializers.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)
