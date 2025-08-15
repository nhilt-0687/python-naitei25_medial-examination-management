from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re

class ComplexPasswordValidator:
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(
                _("Mật khẩu phải có ít nhất 8 ký tự."),
                code='password_too_short',
            )
        
        if not re.search(r'\d', password):
            raise ValidationError(
                _("Mật khẩu phải chứa ít nhất một chữ số."),
                code='password_no_digit',
            )
        
        if not re.search(r'[A-Za-z]', password):
            raise ValidationError(
                _("Mật khẩu phải chứa ít nhất một chữ cái."),
                code='password_no_letter',
            )
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError(
                _("Mật khẩu phải chứa ít nhất một ký tự đặc biệt (!@#$%^&*(),.?\":{}|<>)."),
                code='password_no_special',
            )

    def get_help_text(self):
        return _(
            "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất một chữ số, một chữ cái và một ký tự đặc biệt."
        )
