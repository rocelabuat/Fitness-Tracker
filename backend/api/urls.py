from django.urls import path
from .import views

urlpatterns = [
    path('fittracker/', views.fittrackerView),
]