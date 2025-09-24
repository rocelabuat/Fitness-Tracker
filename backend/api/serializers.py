from rest_framework import serializers
from fittracker.models import User,DailyActivity,ManualEntry

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'gender', 'age', 'height', 'weight', 'step_goal')

class DailyActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyActivity
        fields = ('user', 'date', 'steps', 'distance', 'calories')

class ManualEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualEntry
        fields = ('user', 'date', 'activity', 'duration', 'calories')
