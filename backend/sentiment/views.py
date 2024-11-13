from django.shortcuts import render

# Create your views here.
# sentiment/views.py

from rest_framework import viewsets
from .models import Line, Station, Tweet
from .serializers import LineSerializer, StationSerializer, TweetSerializer

class LineViewSet(viewsets.ModelViewSet):
    queryset = Line.objects.all()
    serializer_class = LineSerializer

class StationViewSet(viewsets.ModelViewSet):
    queryset = Station.objects.all()
    serializer_class = StationSerializer

class TweetViewSet(viewsets.ModelViewSet):
    queryset = Tweet.objects.all()
    serializer_class = TweetSerializer
