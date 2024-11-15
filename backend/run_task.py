import os
import django
from time import sleep
from celery.result import AsyncResult

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from github_health.tasks import fetch_repository_data

# Trigger the task
result = fetch_repository_data.delay("tensorflow/tensorflow")
print(f"Task started with ID: {result.id}")

# Monitor the task
while not result.ready():  # Wait for the task to complete
    print(f"Task status: {result.status}")
    sleep(5)  # Check every 5 seconds

# Check if the task succeeded or failed
if result.status == 'SUCCESS':
    print("Task completed successfully!")
    print("Task result:", result.get())
elif result.status == 'FAILURE':
    print("Task failed!")
    print("Error:", result.traceback)
