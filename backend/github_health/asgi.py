from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from github_health.consumers import TaskStatusConsumer

application = ProtocolTypeRouter({
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/task-updates/", TaskStatusConsumer.as_asgi()),
        ])
    ),
})
