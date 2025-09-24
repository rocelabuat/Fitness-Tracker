from django.urls import path
from .import views

urlpatterns = [
    path('fittracker/', views.fittrackerView),
    path('fittracker/<int:pk>/', views.fittrackerDetailView),
    path('daily-activity/', views.DailyActivityListCreateView.as_view(), name='daily-activity-list-create'),
    path('manual-entry/', views.ManualEntryListCreateView.as_view(), name='manual-entry-list-create'),
]