from django.db import models

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    age = models.IntegerField()
    height = models.IntegerField()
    weight = models.IntegerField()
    gender = models.CharField(max_length=100)
    step_goal = models.IntegerField(default=10000)

    def __str__(self):
        return self.username
    




