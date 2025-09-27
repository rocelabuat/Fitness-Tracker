from django.contrib import admin
from .models import User, DailyActivity, ManualEntry

# Register your models here.
admin.site.register(User)
admin.site.register(DailyActivity)
admin.site.register(ManualEntry)