from rest_framework import serializers
from fittracker.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'first_name', 'last_name', 'email', 'gender', 'age', 'height', 'weight', 'step_goal')