from django.db import models

# Create your models here.

# It inherits from models.Model, which is the base class for all Django models.
class RoomMember(models.Model):
    name=models.CharField(max_length=200)
    uid=models.CharField(max_length=200)
    #uid=models.IntegerField(default=0)
    room_name=models.CharField(max_length=200)
    # date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name