from django.urls import path
from .import views

urlpatterns = [
    path('add-user/', views.addUser),
    path('update-user/<int:pk>/', views.updateUserView),
    path('login/', views.login_view, name='login'),
    path('daily-activity/', views.DailyActivityListCreateView.as_view(), name='daily-activity-list-create'),
    path('daily-activity/<int:pk>/', views.DailyActivityRetrieveUpdateDestroyView.as_view(), name='daily-activity-retrieve-update-destroy'),
    path('manual-entry/', views.ManualEntryListCreateView.as_view(), name='manual-entry-list-create'),
    path('manual-entry/<int:pk>/', views.ManualEntryRetrieveUpdateDestroyView.as_view(), name='manual-entry-retrieve-update-destroy'),
    path('weekly-activity/<int:user_id>/', views.weeaklyActivityView, name='weekly-activity'),
    path('daily-activity/user/<int:user_id>/', views.DailyActivityByUserView.as_view(), name='daily-activitys-by-user'),
    path('manual-entry/user/<int:user_id>/', views.ManualEntryByUserView.as_view(), name='manual-entry-by-user'),
    path('delete-activity/<int:pk>/', views.deleteActivity, name='delete-activity'),
]