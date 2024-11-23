"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from github_health.consumers import TaskStatusConsumer  # Make sure this path is correct

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')  # Correct reference to settings

# ASGI application setup
application = ProtocolTypeRouter({
    "http": get_asgi_application(),  # Handles traditional HTTP requests
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/task-updates/", TaskStatusConsumer.as_asgi()),  # WebSocket route
        ])
    ),
})
