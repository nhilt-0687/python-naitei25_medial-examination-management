# Generated by Django 5.2.4 on 2025-07-30 00:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("patients", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="patient",
            name="gender",
            field=models.CharField(
                choices=[("M", "MALE"), ("F", "FEMALE"), ("O", "OTHER")], max_length=2
            ),
        ),
    ]
