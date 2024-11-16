import os
import django
from time import sleep
from celery.result import AsyncResult

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from github_health.tasks import fetch_repository_data

# List of repositories to fetch data for
repositories = [
    "sindresorhus/awesome",  # Popular curated list repository
    "denoland/deno",         # Small but active TypeScript runtime repository
    "vercel/next.js",        # Popular but not overwhelming for analytics
    "mitchellh/vagrant",     # Developer-focused, medium-sized repository
    "psf/black"   # Replacing octocat/Hello-World
]

# Trigger tasks for all repositories
tasks = {}
for repo in repositories:
    result = fetch_repository_data.delay(repo)
    tasks[repo] = result
    print(f"Task started for {repo} with ID: {result.id}")

# Monitor the tasks
while any(not task.ready() for task in tasks.values()):  # Wait for all tasks to complete
    for repo, task in tasks.items():
        print(f"Task status for {repo}: {task.status}")
    sleep(5)  # Check every 5 seconds

# Check the results
for repo, task in tasks.items():
    print(f"Results for {repo}:")
    if task.status == 'SUCCESS':
        print("Task completed successfully!")
    elif task.status == 'FAILURE':
        print("Task failed!")
        print("Error:", task.traceback)

