from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TaskStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = "task_updates"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_task_update(self, event):
        # Send data to WebSocket
        await self.send(text_data=json.dumps(event["data"]))
