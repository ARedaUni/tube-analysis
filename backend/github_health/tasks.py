from uuid import uuid4
from celery import chord, shared_task, group
from github import Github, GithubException, RateLimitExceededException
from datetime import timedelta
from django.utils.timezone import make_aware, is_aware, now
from .models import Repository, Contributor, RepositoryContributor, Issue, PullRequest, Comment
from transformers import pipeline
from django.core.cache import cache
import os
from statistics import median
from collections import Counter
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# def send_task_update(message):
#     channel_layer = get_channel_layer()
#     async_to_sync(channel_layer.group_send)(
#         "task_updates",
#         {"type": "send_task_update", "data": message},
#     )


def ensure_aware(dt):
    """
    Ensure that the datetime object is timezone-aware.
    If it's naive, make it aware. If it's already aware, return as is.
    """
    if dt and not is_aware(dt):
        return make_aware(dt)
    return dt

def file_exists_in_repo(repo, file_path):
    """
    Check if a specific file exists in the given repository.
    Handles GitHub API exceptions gracefully.
    """
    try:
        repo.get_contents(file_path)
        return True
    except GithubException as e:
        if e.status == 404:
            return False
        raise e

def handle_rate_limit(github_client):
    """
    Handle GitHub API rate limiting.
    """
    core_rate_limit = github_client.get_rate_limit().core
    if core_rate_limit.remaining == 0:
        reset_timestamp = core_rate_limit.reset.replace(tzinfo=None).timestamp()
        sleep_time = max(reset_timestamp - time.time(), 0)
        print(f"Rate limit exceeded. Sleeping for {sleep_time} seconds.")
        time.sleep(sleep_time + 1)  # Sleep until rate limit resets



def send_task_update(message):
    """
    Send updates to the WebSocket group 'task_updates'.
    """
    try:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "task_updates",
            {"type": "send_task_update", "data": message},
        )
    except Exception as e:
        print(f"Failed to send task update: {e}")

# @shared_task(bind=True)
# def fetch_repository_data(self, repo_full_name):
#     """
#     Main task to fetch repository data, dynamically updating task state for polling.
#     """
#     self.update_state(state="STARTED", meta={"status": "Started", "message": f"Fetching data for {repo_full_name}"})
#     print(f"Fetching data for repository: {repo_full_name}")

#     token = os.getenv("GITHUB_TOKEN")
#     if not token:
#         error_message = "GitHub token not found!"
#         self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message})
#         print(error_message)
#         return {"status": "FAILURE", "message": error_message}

#     try:
#         github_client = Github(token)
#         repo = github_client.get_repo(repo_full_name)
#     except GithubException as e:
#         error_message = f"Failed to fetch repository data: {e}"
#         self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message})
#         print(error_message)
#         return {"status": "FAILURE", "message": error_message}

#     # Initialize repository
#     repository, created = Repository.objects.update_or_create(
#         name=repo.name,
#         owner=repo.owner.login,
#         defaults={
#             'description': repo.description,
#             'stars': repo.stargazers_count,
#             'forks': repo.forks_count,
#             'open_issues': repo.open_issues_count,
#             'created_at': ensure_aware(repo.created_at),
#             'updated_at': ensure_aware(repo.updated_at),
#         }
#     )

#     self.update_state(
#         state="PROGRESS",
#         meta={"status": "Progress", "message": f"Initialized repository {repo.name}. Starting tasks..."}
#     )

#     # Subtasks
#     tasks = [
#         fetch_contributors_data.s(repo_full_name, repository.id),
#         fetch_issues_data.s(repo_full_name, repository.id),
#         fetch_pull_requests_data.s(repo_full_name, repository.id),
#         fetch_comments_data.s(repo_full_name, repository.id),
#         fetch_additional_metrics.s(repo_full_name, repository.id),
#     ]

#     # Chord to execute all tasks and call a completion task
#     chord(tasks)(on_all_tasks_complete.s(repo_full_name))

#     self.update_state(
#         state="PROGRESS",
#         meta={"status": "Progress", "message": f"Triggered data fetching tasks for {repository.name}."}
#     )

#     return {"status": "SUCCESS", "message": f"Data fetching initiated for {repo_full_name}"}

@shared_task(bind=True)
def fetch_repository_data(self, repo_full_name):
    """
    Main task to fetch repository data, dynamically updating task state for polling.
    """
    self.update_state(state="STARTED", meta={"status": "Started", "message": f"Fetching data for {repo_full_name}"})
    print(f"Fetching data for repository: {repo_full_name}")

    token = os.getenv("GITHUB_TOKEN")
    if not token:
        error_message = "GitHub token not found!"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message})
        print(error_message)
        return {"status": "FAILURE", "message": error_message}

    try:
        github_client = Github(token)
        repo = github_client.get_repo(repo_full_name)
    except GithubException as e:
        error_message = f"Failed to fetch repository data: {e}"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message})
        print(error_message)
        return {"status": "FAILURE", "message": error_message}

    # Initialize repository
    repository, created = Repository.objects.update_or_create(
        name=repo.name,
        owner=repo.owner.login,
        defaults={
            'description': repo.description,
            'stars': repo.stargazers_count,
            'forks': repo.forks_count,
            'open_issues': repo.open_issues_count,
            'created_at': ensure_aware(repo.created_at),
            'updated_at': ensure_aware(repo.updated_at),
        }
    )

    # Subtasks with unique IDs and names
    tasks = []
    subtasks_info = []
    task_definitions = [
        (fetch_contributors_data, 'Fetch Contributors Data'),
        (fetch_issues_data, 'Fetch Issues Data'),
        (fetch_pull_requests_data, 'Fetch Pull Requests Data'),
        (fetch_comments_data, 'Fetch Comments Data'),
        (fetch_additional_metrics, 'Fetch Additional Metrics'),
    ]

    for task_func, task_name in task_definitions:
        task_id = str(uuid4())
        sig = task_func.s(repo_full_name, repository.id).set(task_id=task_id)
        tasks.append(sig)
        subtasks_info.append({'id': task_id, 'name': task_name})

    # Create the chord
    chord_result = chord(tasks)(on_all_tasks_complete.s(repo_full_name))

    # Update the task state with the subtasks information
    self.update_state(
        state="PROGRESS",
        meta={
            "status": "PROGRESS",
            "message": f"Triggered data fetching tasks for {repository.name}.",
            "subtasks": subtasks_info,
        }
    )

    return {
        "status": "PROGRESS",
        "message": f"Triggered data fetching tasks for {repository.name}.",
        "subtasks": subtasks_info,
    }


@shared_task(bind=True)
def on_all_tasks_complete(self, task_results, repo_full_name=None):
    """
    Callback function for when all tasks in the chord are complete.
    """
    try:
        # Log task results for debugging
        print(f"All data fetching tasks completed for {repo_full_name}: {task_results}")

        # Update task state
        self.update_state(
            state="SUCCESS",
            meta={"status": "Completed", "message": f"All tasks completed for {repo_full_name}."}
        )
        return {
            "status": "SUCCESS",
            "message": f"Data fetching completed for {repo_full_name}.",
            "task_results": task_results,
        }
    except Exception as e:
        self.update_state(
            state="FAILURE",
            meta={"status": "Error", "message": f"Error completing tasks for {repo_full_name}: {e}"}
        )
        raise



@shared_task(bind=True)
def fetch_contributors_data(self, repo_full_name, repository_id):
    self.update_state(state="STARTED", meta={"status": "Started", "message": "Fetching contributors data...", "task": "Fetch Contributors Data"})
    print(f"Fetching contributors for repository: {repo_full_name}")

    token = os.getenv("GITHUB_TOKEN")
    if not token:
        error_message = "GitHub token not found!"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Contributors Data"})
        return {"status": "Error", "message": error_message}

    try:
        repository = Repository.objects.get(id=repository_id)
        github_client = Github(token)

        # Check cache
        cache_key = f"contributors_{repo_full_name}"
        contributors_data = cache.get(cache_key)

        if contributors_data is None:
            repo = github_client.get_repo(repo_full_name)
            contributors = repo.get_contributors()
            contributors_data = [(contributor.login, contributor.contributions) for contributor in contributors]
            cache.set(cache_key, contributors_data, 6 * 3600)

        contributor_contributions = []
        for username, contributions in contributors_data:
            contrib_obj, _ = Contributor.objects.update_or_create(
                username=username,
                defaults={'total_contributions': contributions}
            )
            RepositoryContributor.objects.update_or_create(
                repository=repository,
                contributor=contrib_obj,
                defaults={'contributions': contributions}
            )
            contributor_contributions.append((username, contributions))

        if contributor_contributions:
            contributor_contributions.sort(key=lambda x: x[1], reverse=True)
            top_contributors = contributor_contributions[:5]
            repository.top_contributors = ', '.join([login for login, _ in top_contributors])
        else:
            repository.top_contributors = ''

        repository.save()
        self.update_state(state="SUCCESS", meta={"status": "Completed", "message": "Contributors data fetched successfully.", "task": "Fetch Contributors Data"})
        return {"status": "Completed", "message": "Contributors data fetched successfully."}
    except GithubException as e:
        error_message = f"Error fetching contributors: {e}"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Contributors Data"})
        return {"status": "Error", "message": error_message}


@shared_task(bind=True)
def fetch_issues_data(self, repo_full_name, repository_id):
    self.update_state(state="STARTED", meta={"status": "Started", "message": "Fetching issues data...", "task": "Fetch Issues Data"})
    print(f"Fetching issues for repository: {repo_full_name}")

    token = os.getenv("GITHUB_TOKEN")
    if not token:
        error_message = "GitHub token not found!"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Issues Data"})
        return {"status": "Error", "message": error_message}

    try:
        repository = Repository.objects.get(id=repository_id)
        since_date = now() - timedelta(days=90)
        github_client = Github(token)

        # Check cache
        cache_key = f"issues_{repo_full_name}"
        issues_data = cache.get(cache_key)

        if issues_data is None:
            repo = github_client.get_repo(repo_full_name)
            issues = repo.get_issues(state='all', since=since_date)
            issues_data = []
            for issue in issues:
                if issue.pull_request:
                    continue  # Skip pull requests
                issues_data.append({
                    'number': issue.number,
                    'title': issue.title[:255] if issue.title else "No Title",  # Truncate title
                    'body': issue.body[:5000] if issue.body else "",  # Truncate body to a safe length
                    'state': issue.state[:50] if issue.state else "unknown",  # Truncate state if necessary
                    'created_at': ensure_aware(issue.created_at),
                    'closed_at': ensure_aware(issue.closed_at) if issue.closed_at else None,
                    'comments': issue.comments,
                })
            cache.set(cache_key, issues_data, 3600)

        closed_issues_count = 0
        open_issues_count = 0
        total_issue_close_time = timedelta(0)
        issue_close_times = []

        for issue_data in issues_data:
            issue_obj, created = Issue.objects.update_or_create(
                repository=repository,
                issue_number=issue_data['number'],
                defaults={
                    'title': issue_data['title'],  # Truncated title
                    'body': issue_data['body'],  # Truncated body
                    'state': issue_data['state'],  # Truncated state
                    'created_at': issue_data['created_at'],
                    'closed_at': issue_data['closed_at'],
                }
            )

            if issue_data['state'] == 'closed' and issue_data['closed_at']:
                closed_issues_count += 1
                close_time = (issue_data['closed_at'] - issue_data['created_at'])
                total_issue_close_time += close_time
                issue_close_times.append(close_time.total_seconds())
            else:
                open_issues_count += 1

        avg_issue_close_time = (
            total_issue_close_time / closed_issues_count if closed_issues_count > 0 else None
        )

        # Compute median issue close time
        median_issue_close_time = None
        if issue_close_times:
            median_seconds = median(issue_close_times)
            median_issue_close_time = timedelta(seconds=median_seconds)

        # Compute issue resolution rate
        total_issues = closed_issues_count + open_issues_count
        issue_resolution_rate = (closed_issues_count / total_issues) * 100 if total_issues > 0 else 0

        repository.avg_issue_close_time = avg_issue_close_time
        repository.median_issue_response_time = median_issue_close_time
        repository.open_issues_count = open_issues_count
        repository.closed_issues_count = closed_issues_count
        repository.issue_resolution_rate = issue_resolution_rate
        repository.save()

        self.update_state(state="SUCCESS", meta={"status": "Completed", "message": "Issues data fetched successfully.", "task": "Fetch Issues Data"})
        return {"status": "Completed", "message": "Issues data fetched successfully."}
    except GithubException as e:
        error_message = f"Error fetching issues: {e}"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Issues Data"})
        return {"status": "Error", "message": error_message}





@shared_task(bind=True)
def fetch_pull_requests_data(self, repo_full_name, repository_id):
    self.update_state(state="STARTED", meta={"status": "Started", "message": "Fetching pull requests data...", "task": "Fetch Pull Requests Data"})
    print(f"Fetching pull requests for repository: {repo_full_name}")

    token = os.getenv("GITHUB_TOKEN")
    if not token:
        error_message = "GitHub token not found!"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Pull Requests Data"})
        return {"status": "Error", "message": error_message}

    try:
        repository = Repository.objects.get(id=repository_id)
        since_date = now() - timedelta(days=90)
        github_client = Github(token)

        # Check cache
        cache_key = f"pull_requests_{repo_full_name}"
        prs_data = cache.get(cache_key)

        if prs_data is None:
            prs_data = []
            repo = github_client.get_repo(repo_full_name)
            pulls = repo.get_pulls(state='all', sort='created', direction='desc')
            for pr in pulls:
                if ensure_aware(pr.created_at) < since_date:
                    break
                prs_data.append({
                    'number': pr.number,
                    'title': pr.title,
                    'body': pr.body,
                    'state': pr.state,
                    'created_at': ensure_aware(pr.created_at),
                    'merged_at': ensure_aware(pr.merged_at) if pr.merged_at else None,
                    'merged': pr.is_merged(),
                })
            cache.set(cache_key, prs_data, 3600)

        merged_pr_count = 0
        unmerged_pr_count = 0
        total_pr_merge_time = timedelta(0)
        pr_merge_times = []

        for pr_data in prs_data:
            pr_obj, created = PullRequest.objects.update_or_create(
                repository=repository,
                pr_number=pr_data['number'],
                defaults={
                    'title': pr_data['title'],
                    'body': pr_data['body'],
                    'state': pr_data['state'],
                    'merged': pr_data['merged'],
                    'created_at': pr_data['created_at'],
                    'merged_at': pr_data['merged_at'],
                }
            )

            if pr_data['merged'] and pr_data['merged_at']:
                merged_pr_count += 1
                merge_time = (pr_data['merged_at'] - pr_data['created_at'])
                total_pr_merge_time += merge_time
                pr_merge_times.append(merge_time.total_seconds())
            else:
                unmerged_pr_count += 1

        avg_pr_merge_time = (
            total_pr_merge_time / merged_pr_count if merged_pr_count > 0 else None
        )

        median_pr_merge_time = None
        if pr_merge_times:
            median_seconds = median(pr_merge_times)
            median_pr_merge_time = timedelta(seconds=median_seconds)

        total_prs = merged_pr_count + unmerged_pr_count
        pr_merge_rate = (merged_pr_count / total_prs) * 100 if total_prs > 0 else 0

        repository.merged_pr_count = merged_pr_count
        repository.unmerged_pr_count = unmerged_pr_count
        repository.avg_pr_merge_time = avg_pr_merge_time
        repository.median_pr_response_time = median_pr_merge_time
        repository.pr_merge_rate = pr_merge_rate
        repository.save()

        self.update_state(state="SUCCESS", meta={"status": "Completed", "message": "Pull requests data fetched successfully.", "task": "Fetch Pull Requests Data"})
        return {"status": "Completed", "message": "Pull requests data fetched successfully."}
    except GithubException as e:
        error_message = f"Error fetching pull requests: {e}"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Pull Requests Data"})
        return {"status": "Error", "message": error_message}


@shared_task(bind=True)
def fetch_comments_data(self, repo_full_name, repository_id):
    self.update_state(state="STARTED", meta={"status": "Started", "message": "Fetching comments data...", "task": "Fetch Comments Data"})
    print(f"Fetching comments for repository: {repo_full_name}")
    
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        error_message = "GitHub token not found!"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Comments Data"})
        return {"status": "Error", "message": error_message}

    try:
        repository = Repository.objects.get(id=repository_id)
        since_date = now() - timedelta(days=90)
        github_client = Github(token)

        # Check cache
        cache_key = f"comments_{repo_full_name}"
        comments_data = cache.get(cache_key)

        if comments_data is None:
            try:
                repo = github_client.get_repo(repo_full_name)
                comments = repo.get_issues_comments(since=since_date)
                comments_data = [
                    {
                        'author': comment.user.login,
                        'body': comment.body,
                        'created_at': ensure_aware(comment.created_at),
                        'issue_number': comment.issue_url.split('/')[-1],
                    }
                    for comment in comments
                ]
                cache.set(cache_key, comments_data, 3600)
            except RateLimitExceededException:
                handle_rate_limit(github_client)
                return fetch_comments_data(repo_full_name, repository_id)
            except GithubException as e:
                error_message = f"Error fetching comments: {e}"
                self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Comments Data"})
                return {"status": "Error", "message": error_message}
        else:
            print("Loaded comments from cache.")

        # Sentiment analysis setup
        sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
        total_comments = len(comments_data)
        positive_comments = 0
        negative_comments = 0
        neutral_comments = 0

        for comment_data in comments_data:
            try:
                sentiment_result = sentiment_analyzer(comment_data['body'][:512])[0]
                sentiment = sentiment_result['label']
                if '5' in sentiment or '4' in sentiment:
                    positive_comments += 1
                    sentiment_label = 'positive'
                elif '1' in sentiment or '2' in sentiment:
                    negative_comments += 1
                    sentiment_label = 'negative'
                else:
                    neutral_comments += 1
                    sentiment_label = 'neutral'
            except Exception as e:
                print(f"Error analyzing sentiment: {e}")
                sentiment_label = 'neutral'
                neutral_comments += 1

            Comment.objects.update_or_create(
                repository=repository,
                author=comment_data['author'],
                body=comment_data['body'],
                created_at=comment_data['created_at'],
                content_type='issue',  # Assuming issue comments
                object_id=comment_data['issue_number'],
                defaults={'sentiment': sentiment_label}
            )

        # Calculate percentages
        if total_comments > 0:
            positive_comment_percentage = (positive_comments / total_comments) * 100
            negative_comment_percentage = (negative_comments / total_comments) * 100
            neutral_comment_percentage = (neutral_comments / total_comments) * 100
        else:
            positive_comment_percentage = negative_comment_percentage = neutral_comment_percentage = 0

        repository.positive_comment_percentage = positive_comment_percentage
        repository.negative_comment_percentage = negative_comment_percentage
        repository.neutral_comment_percentage = neutral_comment_percentage
        repository.save()

        self.update_state(state="SUCCESS", meta={"status": "Completed", "message": "Comments data fetched successfully.", "task": "Fetch Comments Data"})
        return {"status": "Completed", "message": "Comments data fetched successfully."}
    except Exception as e:
        error_message = f"Unexpected error: {e}"
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Comments Data"})
        return {"status": "Error", "message": error_message}


@shared_task(bind=True)
def fetch_additional_metrics(self, repo_full_name, repository_id):
    try:
        self.update_state(state="STARTED", meta={"status": "Started", "message": "Fetching additional metrics...", "task": "Fetch Additional Metrics"})
        print(f"Fetching additional metrics for repository: {repo_full_name}")

        token = os.getenv("GITHUB_TOKEN")
        if not token:
            error_message = "GitHub token not found!"
            self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Additional Metrics"})
            return {"status": "Error", "message": error_message}

        repository = Repository.objects.get(id=repository_id)
        since_date = now() - timedelta(days=90)
        github_client = Github(token)

        repo = github_client.get_repo(repo_full_name)

        # Commit count
        commit_count = cache.get(f"commits_{repo_full_name}")
        if commit_count is None:
            commit_count = repo.get_commits(since=since_date).totalCount
            cache.set(f"commits_{repo_full_name}", commit_count, 7 * 24 * 3600)

        # Languages
        languages = cache.get(f"languages_{repo_full_name}")
        if languages is None:
            languages = repo.get_languages()
            cache.set(f"languages_{repo_full_name}", languages, 30 * 24 * 3600)

        # Community health files
        contributing_guidelines = file_exists_in_repo(repo, 'CONTRIBUTING.md')
        code_of_conduct = file_exists_in_repo(repo, 'CODE_OF_CONDUCT.md')
        issue_template = file_exists_in_repo(repo, '.github/ISSUE_TEMPLATE.md') or file_exists_in_repo(repo, '.github/ISSUE_TEMPLATE')
        pr_template = file_exists_in_repo(repo, '.github/PULL_REQUEST_TEMPLATE.md') or file_exists_in_repo(repo, '.github/PULL_REQUEST_TEMPLATE')

        # Star growth rate
        star_growth_rate = cache.get(f"star_growth_rate_{repo_full_name}")
        if star_growth_rate is None:
            thirty_days_ago = now() - timedelta(days=30)
            stargazers = repo.get_stargazers_with_dates()
            stars_last_month = sum(
                1 for star in stargazers if ensure_aware(star.starred_at) >= thirty_days_ago
            )
            star_growth_rate = stars_last_month / 30
            cache.set(f"star_growth_rate_{repo_full_name}", star_growth_rate, 30 * 24 * 3600)

        # Dependencies (example, adjust if needed)
        dependencies = []  # Mock example, add logic if dependency data is available

        repository.commit_count = commit_count
        repository.languages = languages
        repository.contributing_guidelines = contributing_guidelines
        repository.code_of_conduct = code_of_conduct
        repository.issue_template = issue_template
        repository.pr_template = pr_template
        repository.star_growth_rate = star_growth_rate
        repository.dependencies = dependencies  # Save dependencies if implemented
        repository.save()

        self.update_state(state="SUCCESS", meta={"status": "Completed", "message": "Additional metrics fetched successfully.", "task": "Fetch Additional Metrics"})
        return {"status": "Completed", "message": "Additional metrics fetched successfully."}
    except Exception as e:
        error_message = f"Unexpected error: {e}"
        print(f"Error in fetch_additional_metrics: {e}")
        self.update_state(state="FAILURE", meta={"status": "Error", "message": error_message, "task": "Fetch Additional Metrics"})
        return {"status": "Error", "message": error_message}
