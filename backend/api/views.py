#from django.shortcuts import render
#from django.http import JsonResponse
from fittracker.models import User, DailyActivity, ManualEntry
from .serializers import UserSerializer, DailyActivitySerializer, ManualEntrySerializer
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.decorators import api_view
from django.db.models import Sum, Avg
from django.utils.timezone import now, timedelta

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
         
@api_view(['GET'])
def weeaklyActivityView(request, user_id):
    end_date = now().date()
    start_date = end_date - timedelta(days=7)

    # DailyActivity: filter by user and date
    daily_qs = DailyActivity.objects.filter(
        user_id=user_id,
        date__range=[start_date, end_date]
    )

    # ManualEntry: filter by user and date
    manual_qs = ManualEntry.objects.filter(
        user_id=user_id,
        date__range=[start_date, end_date]
    )

    # Average steps and distance from DailyActivity only
    avg_steps = daily_qs.aggregate(avg_steps=Avg('steps'))['avg_steps'] or 0
    avg_distance = daily_qs.aggregate(avg_distance=Avg('distance'))['avg_distance'] or 0

    # Calories from both DailyActivity and ManualEntry
    daily_calories = daily_qs.aggregate(sum_cal=Sum('calories'), avg_cal=Avg('calories'))
    manual_calories = manual_qs.aggregate(sum_cal=Sum('calories'), avg_cal=Avg('calories'))

    total_calories = (daily_calories['sum_cal'] or 0) + (manual_calories['sum_cal'] or 0)

    # Average calories: weighted by number of entries
    daily_count = daily_qs.count()
    manual_count = manual_qs.count()
    total_count = daily_count + manual_count

    avg_calories = 0
    if total_count > 0:
        avg_calories = (
            ((daily_calories['sum_cal'] or 0) + (manual_calories['sum_cal'] or 0)) / total_count
        )

    stats = {
        'average_steps': avg_steps,
        'average_distance': avg_distance,
        'average_calories': avg_calories,
        'total_calories': total_calories,
    }
    return Response(stats, status=status.HTTP_200_OK)

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

class DailyActivityByUserView(generics.ListAPIView):
    serializer_class = DailyActivitySerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return DailyActivity.objects.filter(user_id=user_id)

class ManualEntryByUserView(generics.ListAPIView):
    serializer_class = ManualEntrySerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        return ManualEntry.objects.filter(user_id=user_id)
