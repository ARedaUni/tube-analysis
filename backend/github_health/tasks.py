from celery import shared_task
from github import Github, GithubException
from datetime import timedelta
from django.utils.timezone import make_aware, is_aware, now
from .models import Repository, Contributor, RepositoryContributor, Issue, PullRequest, Comment
from transformers import pipeline
import os
from statistics import median


def ensure_aware(dt):
    """
    Ensure that the datetime object is timezone-aware.
    If it's naive, make it aware. If it's already aware, return as is.
    """
    if dt and not is_aware(dt):
        return make_aware(dt)
    return dt


@shared_task
def fetch_repository_data(repo_full_name):
    print(f"Fetching data for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("GitHub token not found!")
        return

    try:
        github_client = Github(token)
        repo = github_client.get_repo(repo_full_name)
    except GithubException as e:
        print(f"Failed to fetch repository data: {e}")
        return

    # Save repository data
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
    print(f"Repository {'created' if created else 'updated'}: {repository}")

    # Process contributors
    try:
        contributors = repo.get_contributors()
        contributor_contributions = []
        for contributor in contributors:
            contrib_obj, _ = Contributor.objects.update_or_create(
                username=contributor.login,
                defaults={'total_contributions': contributor.contributions}
            )
            RepositoryContributor.objects.update_or_create(
                repository=repository,
                contributor=contrib_obj,
                defaults={'contributions': contributor.contributions}
            )
            contributor_contributions.append((contributor.login, contributor.contributions))

        contributor_contributions.sort(key=lambda x: x[1], reverse=True)
        top_contributors = contributor_contributions[:5]
    except GithubException as e:
        print(f"Error fetching contributors: {e}")
        top_contributors = []

    since_date = now() - timedelta(days=3)

    # Process issues
    try:
        issues = repo.get_issues(state='all', since=since_date)
        closed_issues_count, open_issues_count, total_issue_close_time = 0, 0, timedelta(0)
        issue_response_times, issue_objects = [], []

        for issue in issues:
            if issue.pull_request:
                continue

            first_response_time = None
            comments = issue.get_comments()
            if comments.totalCount > 0:
                first_comment = comments[0]
                first_response_time = ensure_aware(first_comment.created_at) - ensure_aware(issue.created_at)
                issue_response_times.append(first_response_time.total_seconds())

            issue_obj, _ = Issue.objects.update_or_create(
                repository=repository,
                issue_number=issue.number,
                defaults={
                    'title': issue.title[:255],
                    'body': issue.body,
                    'state': issue.state[:50],
                    'created_at': ensure_aware(issue.created_at),
                    'closed_at': ensure_aware(issue.closed_at) if issue.closed_at else None,
                    'response_time': first_response_time,
                }
            )
            issue_objects.append(issue_obj)

            if issue.state == 'closed' and issue.closed_at:
                closed_issues_count += 1
                total_issue_close_time += (ensure_aware(issue.closed_at) - ensure_aware(issue.created_at))
            else:
                open_issues_count += 1

        avg_issue_close_time = (
            total_issue_close_time / closed_issues_count if closed_issues_count > 0 else None
        )
    except GithubException as e:
        print(f"Error fetching issues: {e}")
        closed_issues_count, open_issues_count, avg_issue_close_time = 0, 0, None

    # Process pull requests
    try:
        pull_requests = repo.get_pulls(state='all')
        merged_pr_count, unmerged_pr_count, total_pr_merge_time = 0, 0, timedelta(0)
        pr_response_times, pull_request_objects = [], []

        for pr in pull_requests:
            if pr.created_at < since_date:
                continue

            first_response_time = None
            comments = pr.get_issue_comments()
            if comments.totalCount > 0:
                first_comment = comments[0]
                first_response_time = ensure_aware(first_comment.created_at) - ensure_aware(pr.created_at)
                pr_response_times.append(first_response_time.total_seconds())

            pr_obj, _ = PullRequest.objects.update_or_create(
                repository=repository,
                pr_number=pr.number,
                defaults={
                    'title': pr.title[:255],
                    'body': pr.body,
                    'state': pr.state[:50],
                    'merged': pr.is_merged(),
                    'created_at': ensure_aware(pr.created_at),
                    'merged_at': ensure_aware(pr.merged_at) if pr.merged_at else None,
                    'response_time': first_response_time,
                }
            )
            pull_request_objects.append(pr_obj)

            if pr.is_merged() and pr.merged_at:
                merged_pr_count += 1
                total_pr_merge_time += (ensure_aware(pr.merged_at) - ensure_aware(pr.created_at))
            else:
                unmerged_pr_count += 1

        avg_pr_merge_time = (
            total_pr_merge_time / merged_pr_count if merged_pr_count > 0 else None
        )
    except GithubException as e:
        print(f"Error fetching pull requests: {e}")
        merged_pr_count, unmerged_pr_count, avg_pr_merge_time = 0, 0, None

    # Fetch commit statistics
    try:
        commits = repo.get_commits(since=since_date)
        commit_count = commits.totalCount
        commit_frequency = commit_count / 3.0
    except GithubException as e:
        print(f"Error fetching commits: {e}")
        commit_count, commit_frequency = None, None

    # Fetch code frequency
    try:
        code_freq = repo.get_stats_code_frequency()
        if code_freq:
            code_frequency = {
                'weeks': [stat[0] for stat in code_freq],
                'additions': [stat[1] for stat in code_freq],
                'deletions': [stat[2] for stat in code_freq],
            }
        else:
            code_frequency = {}
    except GithubException as e:
        print(f"Error fetching code frequency: {e}")
        code_frequency = {}

    # Calculate star growth rate
    try:
        star_history = repo.get_stargazers_with_dates()
        star_counts = sum(1 for star in star_history if ensure_aware(star.starred_at) >= since_date)
        star_growth_rate = star_counts / 3.0
    except GithubException as e:
        print(f"Error fetching stargazers: {e}")
        star_growth_rate = 0

    # Update repository with new metrics
    repository.avg_issue_close_time = avg_issue_close_time
    repository.avg_pr_merge_time = avg_pr_merge_time
    repository.commit_count = commit_count
    repository.commit_frequency = commit_frequency
    repository.code_frequency = code_frequency
    repository.star_growth_rate = star_growth_rate
    repository.save()

    print(f"Updated repository metrics for {repository.name}")
