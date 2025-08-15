from django.db import models
from core.models import BaseModel
from appointments.models import Appointment
from patients.models import Patient
from common.enums import PaymentStatus, PaymentMethod, TransactionStatus
from common.constants import PAYMENT_LENGTH, DECIMAL_MAX_DIGITS, DECIMAL_DECIMAL_PLACES, ENUM_LENGTH

class Bill(BaseModel):
    appointment = models.ForeignKey(Appointment, on_delete=models.RESTRICT)
    patient = models.ForeignKey(Patient, on_delete=models.RESTRICT)
    total_cost = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)
    insurance_discount = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES, blank=True, null=True)
    amount = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)
    status = models.CharField(max_length=ENUM_LENGTH["DEFAULT"], choices=[(p.value, p.name) for p in PaymentStatus])

    def __str__(self):
        return f"Bill {self.pk}"


class BillDetail(BaseModel):
    bill = models.ForeignKey(Bill, on_delete=models.RESTRICT, related_name='details')
    item_type = models.CharField(max_length=PAYMENT_LENGTH["ITEM_TYPE"])
    quantity = models.IntegerField()
    insurance_discount = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES, blank=True, null=True)
    unit_price = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)
    total_price = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)

    def __str__(self):
        return f"BillDetail {self.pk}"


class Transaction(BaseModel):
    bill = models.ForeignKey(Bill, on_delete=models.RESTRICT)
    amount = models.DecimalField(max_digits=DECIMAL_MAX_DIGITS, decimal_places=DECIMAL_DECIMAL_PLACES)
    payment_method = models.CharField(max_length=ENUM_LENGTH["DEFAULT"], choices=[(m.value, m.name) for m in PaymentMethod])
    transaction_date = models.DateTimeField()
    status = models.CharField(max_length=ENUM_LENGTH["DEFAULT"], choices=[(t.value, t.name) for t in TransactionStatus])

    def __str__(self):
        return f"Transaction {self.pk}"
