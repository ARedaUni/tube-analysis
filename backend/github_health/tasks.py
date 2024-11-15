from celery import shared_task
from github import Github
from datetime import timedelta
from django.utils import timezone
from .models import Repository, Contributor, Issue, PullRequest, Comment
from transformers import pipeline
import os

@shared_task
def fetch_repository_data(repo_full_name):
    print(f"Fetching data for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        print("GitHub token not found!")
        return

    github_client = Github(token)
    repo = github_client.get_repo(repo_full_name)

    # Save repository data
    repository, created = Repository.objects.update_or_create(
        name=repo.name,
        owner=repo.owner.login,
        defaults={
            'description': repo.description,
            'stars': repo.stargazers_count,
            'forks': repo.forks_count,
            'open_issues': repo.open_issues_count,
            'created_at': repo.created_at,
            'updated_at': repo.updated_at,
        }
    )

    print(f"Repository {'created' if created else 'updated'}: {repository}")

    # Save Contributors
    contributors = repo.get_contributors()
    contributor_contributions = []
    for contributor in contributors:
        contrib_obj, _ = Contributor.objects.update_or_create(
            username=contributor.login,
            defaults={'contributions': contributor.contributions}
        )
        repository.contributors.add(contrib_obj)
        contributor_contributions.append((contributor.login, contributor.contributions))

    # Compute Top Contributors
    contributor_contributions.sort(key=lambda x: x[1], reverse=True)
    top_contributors = contributor_contributions[:5]
    print(f"Top Contributors: {top_contributors}")

    # Filter by Last 7 Days
    since_date = timezone.now() - timedelta(days=7)

    # Save Issues (Last 7 Days)
    issues = repo.get_issues(state='all', since=since_date)
    total_issue_close_time = timedelta(0)
    closed_issues_count = 0
    open_issues_count = 0

    for issue in issues:
        if issue.pull_request:
            continue  # Skip pull requests here
        issue_obj, _ = Issue.objects.update_or_create(
            repository=repository,
            issue_number=issue.number,
            defaults={
                'title': issue.title,
                'body': issue.body,
                'state': issue.state,
                'created_at': issue.created_at,
                'closed_at': issue.closed_at,
            }
        )

        # Track issue close time
        if issue.state == 'closed' and issue.closed_at:
            total_issue_close_time += (issue.closed_at - issue.created_at)
            closed_issues_count += 1
        else:
            open_issues_count += 1

    # Compute Average Issue Close Time
    avg_issue_close_time = (
        total_issue_close_time / closed_issues_count if closed_issues_count > 0 else None
    )

    # Save Pull Requests (Last 7 Days)
    pull_requests = repo.get_pulls(state='all')
    total_pr_merge_time = timedelta(0)
    merged_pr_count = 0
    unmerged_pr_count = 0

    for pr in pull_requests:
        if pr.created_at < since_date:
            continue  # Skip PRs created before the last 7 days
        pr_obj, _ = PullRequest.objects.update_or_create(
            repository=repository,
            pr_number=pr.number,
            defaults={
                'title': pr.title,
                'body': pr.body,
                'state': pr.state,
                'merged': pr.is_merged(),
                'created_at': pr.created_at,
                'merged_at': pr.merged_at,
            }
        )

        # Track PR merge time
        if pr.is_merged() and pr.merged_at:
            total_pr_merge_time += (pr.merged_at - pr.created_at)
            merged_pr_count += 1
        else:
            unmerged_pr_count += 1

    # Compute Average PR Merge Time
    avg_pr_merge_time = (
        total_pr_merge_time / merged_pr_count if merged_pr_count > 0 else None
    )

    # Sentiment Analysis of Comments (Last 7 Days)
    sentiment_analyzer = pipeline("sentiment-analysis")
    for issue in issues:
        comments = issue.get_comments(since=since_date)
        for comment in comments:
            sentiment = sentiment_analyzer(comment.body)[0]
            Comment.objects.update_or_create(
                repository=repository,
                content_type='issue',
                object_id=issue.number,
                author=comment.user.login,
                defaults={
                    'body': comment.body,
                    'created_at': comment.created_at,
                    'sentiment': sentiment['label'],  # e.g., 'POSITIVE', 'NEGATIVE', 'NEUTRAL'
                }
            )

    for pr in pull_requests:
        if pr.created_at < since_date:
            continue
        comments = pr.get_issue_comments(since=since_date)
        for comment in comments:
            sentiment = sentiment_analyzer(comment.body)[0]
            Comment.objects.update_or_create(
                repository=repository,
                content_type='pull_request',
                object_id=pr.number,
                author=comment.user.login,
                defaults={
                    'body': comment.body,
                    'created_at': comment.created_at,
                    'sentiment': sentiment['label'],
                }
            )

    # Update repository metrics
    repository.avg_issue_close_time = avg_issue_close_time
    repository.avg_pr_merge_time = avg_pr_merge_time
    repository.top_contributors = ', '.join([c[0] for c in top_contributors])
    repository.open_issues_count = open_issues_count
    repository.closed_issues_count = closed_issues_count
    repository.merged_pr_count = merged_pr_count
    repository.unmerged_pr_count = unmerged_pr_count
    repository.save()

    print(f"Updated repository metrics for {repository.name}")
