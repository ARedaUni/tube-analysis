# # config/celery.py

# import os
# from celery import Celery

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# app = Celery('backend')
# app.conf.beat_scheduler = 'django_celery_beat.schedulers:DatabaseScheduler'
# app.config_from_object('django.conf:settings', namespace='CELERY')

# # 
# app.autodiscover_tasks()

from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('your_project_name')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Celery Configuration - Make sure Redis URL is passed correctly
app.conf.update(
    broker_url=os.getenv('REDIS_URL'),
    result_backend=os.getenv('REDIS_URL'),
    accept_content=['json'],
    result_serializer='json',
    task_serializer='json',
    timezone='UTC',
)
