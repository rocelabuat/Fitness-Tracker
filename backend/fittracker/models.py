from django.db import models

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.IntegerField(null=True)
    height = models.IntegerField(null=True)
    weight = models.IntegerField(null=True)
    gender = models.CharField(max_length=100, null=True)
    step_goal = models.IntegerField(default=10000, null=True)

    def __str__(self):
        return self.username
    
class DailyActivity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    steps = models.IntegerField()
    distance = models.FloatField()
    calories = models.IntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.date}"

class ManualEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    activity = models.CharField(max_length=100)
    duration = models.IntegerField()
    calories = models.IntegerField()

    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.activity}"    



