from django.shortcuts import render
from agora_token_builder import RtcTokenBuilder
from django.http import JsonResponse
import random
import time
from .models import RoomMember
import json
from django.views.decorators.csrf import csrf_exempt
# Create your views here.


''' In Django, the request object represents an HTTP request that is received by the server. It contains metadata about the request such as headers, method, user session information, and any data sent in the request body (for example, form data or JSON payloads). Understanding the request object is crucial for handling incoming requests and building dynamic web applications in Django.'''
''' if request.method == 'GET':
        # Handle GET request
    elif request.method == 'POST':
        # Handle POST request
    search_query = request.GET.get('q', '')  # Retrieves the value of 'q' parameter or '' if not present    
    username = request.POST.get('username', '')  # Retrieves the value of 'username' parameter or '' if not present'''

def getToken(request):
    appId='a37d5f87bc2f4c40a42eb73fca6a8f4a'
    appCertificate='2174656558174fef9dfe5dd27be2a077'
    channelName= request.GET.get('channel')
    uid=random.randint(1,230)
    role=1

    expirationTimeInSeconds=3600*24  
    currentTimeStamp= time.time()
    privilegeExpiredTs= currentTimeStamp + expirationTimeInSeconds
        
    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse ({'token': token, 'uid': uid}, safe=False)


def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')


# 'POST' method
@csrf_exempt
def createMember(request):
    data= json.loads(request.body) #parse the json object from 'POST' method

    member, created= RoomMember.objects.get_or_create(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
    )

    return JsonResponse({'name': data['name']}, safe=False)    

def getMember(request):
    uid=request.GET.get('UID')
    room_name=request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid=uid,
        room_name=room_name
    )
    return JsonResponse({'name': member.name}, safe=False)


@csrf_exempt
def deleteMember(request):
    data= json.loads(request.body) #parse the json object from 'POST' method

    try:
        member= RoomMember.objects.get(
        name=data['name'],
        uid=data['UID'],
        room_name=data['room_name']
        )
        member.delete()
    except:
        return JsonResponse('error encountered.', safe=False)
    return JsonResponse('member deleted', safe=False)    