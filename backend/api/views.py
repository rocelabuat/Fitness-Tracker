#from django.shortcuts import render
#from django.http import JsonResponse
from fittracker.models import User, DailyActivity, ManualEntry
from .serializers import UserSerializer, DailyActivitySerializer, ManualEntrySerializer
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import api_view
# Create your views here.


@api_view(['GET','POST'])  #this decorator will allow only GET and POST requests
#post use to submit data to the server
#get use to fetch data from the server

def fittrackerView(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
      
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
def fittrackerDetailView(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True) # set partial=True to allow partial updates
        if serializer.is_valid():
            # Ensure only allowed fields are updated
            allowed_fields = {'age', 'height', 'weight', 'gender', 'step_goal'}
            updated_fields = set(request.data.keys())
            if not updated_fields.issubset(allowed_fields):
                return Response({'detail': 'You can only update age, height, weight, gender, or step_goal.'}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
         
class DailyActivityListCreateView(generics.ListCreateAPIView):
    queryset = DailyActivity.objects.all()
    serializer_class = DailyActivitySerializer

class DailyActivityRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DailyActivity.objects.all()
    serializer_class = DailyActivitySerializer

class ManualEntryListCreateView(generics.ListCreateAPIView):
    queryset = ManualEntry.objects.all()
    serializer_class = ManualEntrySerializer

class ManualEntryRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ManualEntry.objects.all()
    serializer_class = ManualEntrySerializer
         