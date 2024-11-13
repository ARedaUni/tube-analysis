# sentiment/urls.py

from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import LineViewSet, StationViewSet, TweetViewSet

router = DefaultRouter()
router.register(r'lines', LineViewSet)
router.register(r'stations', StationViewSet)
router.register(r'tweets', TweetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
