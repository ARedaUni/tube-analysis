import os
import django
from time import sleep
from concurrent.futures import ThreadPoolExecutor, as_completed
from celery.result import AsyncResult, GroupResult
from django.core.cache import cache
from github import GithubException, Github
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from github_health.tasks import fetch_repository_data

# List of repositories to fetch data for
repositories = [
    # "faker-js/faker",
    # "django/django",
    # "vuejs/vue",
    "reactjs/reactjs.org"
    
]





# Adjustable parameters
SLEEP_INTERVAL = 2  # Time in seconds between task status checks
VERBOSE = True  # Enable detailed logging


def monitor_task(task_id):
    """
    Monitor a single Celery task by ID until it completes.
    Recursively monitors subtasks if any are spawned.
    Returns the task result or error traceback.
    """
    task = AsyncResult(task_id)

    while not task.ready():
        if VERBOSE:
            print(f"[{task.id}] Status: {task.status}")
        sleep(SLEEP_INTERVAL)

    # Check the result of the task
    if task.status == "SUCCESS":
        print(f"[{task.id}] Task completed successfully.")
        # Check for subtasks (if applicable)
        if task.children:
            print(f"[{task.id}] Monitoring subtasks...")
            subtask_results = []
            for child in task.children:
                subtask_results.append(monitor_task(child.id))  # Recursive call for subtasks
            return {"status": "SUCCESS", "subtasks": subtask_results}
        else:
            return {"status": "SUCCESS", "result": task.result}
    elif task.status == "FAILURE":
        print(f"[{task.id}] Task failed.")
        return {"status": "FAILURE", "error": task.traceback}


def main():
    cache.clear()
    print("Cache cleared!")
    print("Starting Celery tasks...")
    tasks = {}

    # Trigger tasks for all repositories
    for repo in repositories:
        result = fetch_repository_data.delay(repo)
        tasks[repo] = result.id
        print(f"Task started for {repo} with ID: {result.id}")

    print("\nMonitoring tasks...\n")
    results = {}

    # Use a thread pool to monitor tasks concurrently
    with ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(monitor_task, task_id): repo for repo, task_id in tasks.items()
        }
        for future in as_completed(futures):
            repo = futures[future]
            try:
                result = future.result()
                results[repo] = result
                status = result["status"]
                print(f"[{repo}] Task completed with status: {status}")
                if status == "SUCCESS" and VERBOSE:
                    print(f"[{repo}] Subtasks: {result.get('subtasks', 'None')}")
                elif status == "FAILURE":
                    print(f"[{repo}] Error: {result['error']}")
            except Exception as exc:
                print(f"[{repo}] Monitoring failed with exception: {exc}")

    print("\nAll tasks completed. Summary:\n")
    for repo, result in results.items():
        if result["status"] == "SUCCESS":
            print(f"[{repo}] Task succeeded.")
        elif result["status"] == "FAILURE":
            print(f"[{repo}] Task failed with error:\n{result['error']}")


if __name__ == "__main__":
    main()
