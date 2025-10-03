from rest_framework import serializers
from fittracker.models import User,DailyActivity,ManualEntry

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username', 'password', 'first_name', 'last_name', 'email', 'gender', 'age', 'height', 'weight', 'step_goal')
        extra_kwargs = {
            'password': {'write_only': True}
        }

class DailyActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyActivity
        fields = ('id','user', 'date', 'steps', 'distance', 'calories')

class ManualEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualEntry
        fields = ('id','user', 'date', 'activity', 'duration', 'calories')
