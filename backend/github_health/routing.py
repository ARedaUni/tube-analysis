# your_app/routing.py
from django.urls import path
from .consumers import TaskStatusConsumer

websocket_urlpatterns = [
    path("ws/task-updates/", TaskStatusConsumer.as_asgi()),
]
