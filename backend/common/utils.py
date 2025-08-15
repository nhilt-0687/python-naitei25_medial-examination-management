from django.utils.translation import gettext_lazy as _

def enum_to_choices(enum_class):
    """Chuyển Enum thành tuple choices (value, Label)"""
    return [(e.value, _(str(e.name).capitalize())) for e in enum_class]
