#from django.shortcuts import render
#from django.http import JsonResponse
from fittracker.models import User
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
# Create your views here.


@api_view(['GET']) #this decorator will allow only GET and POST requests
def fittrackerView(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
      
        return Response(serializer.data, status=status.HTTP_200_OK)
    