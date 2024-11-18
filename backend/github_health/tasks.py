from celery import shared_task
from github import Github
from datetime import timedelta
from django.utils import timezone
from .models import Repository, Contributor, Issue, PullRequest, Comment
from transformers import pipeline
import os
from collections import defaultdict

@shared_task
def fetch_repository_data(repo_full_name):
    print(f"Fetching data for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    print(token)
    if not token:
        print("GitHub token not found!")
        return

    try:
        github_client = Github(token)
        repo = github_client.get_repo(repo_full_name)
    except Exception as e:
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

    issue_objects = []
    for issue in issues:
        if issue.pull_request:
            continue  # Skip pull requests here

        # Calculate response time
        first_response_time = None
        if issue.comments:
            first_response_time = issue.get_comments()[0].created_at - issue.created_at

        issue_obj, _ = Issue.objects.update_or_create(
            repository=repository,
            issue_number=issue.number,
            defaults={
                'title': issue.title[:255],
                'body': issue.body,
                'state': issue.state[:50],
                'created_at': issue.created_at,
                'closed_at': issue.closed_at,
                'response_time': first_response_time,
            }
        )
        issue_objects.append(issue_obj)

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

    pull_request_objects = []
    for pr in pull_requests:
        if pr.created_at < since_date:
            continue  # Skip PRs created before the last 7 days

        # Calculate PR response time
        first_response_time = None
        if pr.comments:
            first_response_time = pr.get_issue_comments()[0].created_at - pr.created_at

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
                'response_time': first_response_time,
            }
        )
        pull_request_objects.append(pr_obj)

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
    sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased")
    positive_comments = 0
    negative_comments = 0
    neutral_comments = 0

    comment_objects = []
    for issue in issues:
        comments = issue.get_comments(since=since_date)
        for comment in comments:
            try:
                sentiment = sentiment_analyzer(comment.body)[0]
            except Exception as e:
                print(f"Sentiment analysis failed for comment: {comment.body}, error: {e}")
                continue

            sentiment_label = sentiment['label']
            if sentiment_label == 'POSITIVE':
                positive_comments += 1
            elif sentiment_label == 'NEGATIVE':
                negative_comments += 1
            else:
                neutral_comments += 1

            comment_obj = Comment(
                repository=repository,
                content_type='issue',
                object_id=issue.number,
                author=comment.user.login,
                body=comment.body,
                created_at=comment.created_at,
                sentiment=sentiment_label,
            )
            comment_objects.append(comment_obj)

    for pr in pull_requests:
        if pr.created_at < since_date:
            continue

        comments = pr.get_issue_comments()  # No 'since' argument here
        filtered_comments = [comment for comment in comments if comment.created_at >= since_date]

        for comment in filtered_comments:
            try:
                sentiment = sentiment_analyzer(comment.body)[0]
            except Exception as e:
                print(f"Sentiment analysis failed for comment: {comment.body}, error: {e}")
                continue

            sentiment_label = sentiment['label']
            if sentiment_label == 'POSITIVE':
                positive_comments += 1
            elif sentiment_label == 'NEGATIVE':
                negative_comments += 1
            else:
                neutral_comments += 1

            comment_obj = Comment(
                repository=repository,
                content_type='pull_request',
                object_id=pr.number,
                author=comment.user.login,
                body=comment.body,
                created_at=comment.created_at,
                sentiment=sentiment_label,
            )
            comment_objects.append(comment_obj)

    # Bulk save data for better performance
    Comment.objects.bulk_create(comment_objects, ignore_conflicts=True)
    Issue.objects.bulk_update(issue_objects, ['response_time'])
    PullRequest.objects.bulk_update(pull_request_objects, ['response_time'])

    # Calculate sentiment percentages
    total_comments = positive_comments + negative_comments + neutral_comments
    positive_percentage = (positive_comments / total_comments) * 100 if total_comments else 0
    negative_percentage = (negative_comments / total_comments) * 100 if total_comments else 0
    neutral_percentage = (neutral_comments / total_comments) * 100 if total_comments else 0

    # Fetch commit statistics
    commits = repo.get_commits(since=since_date)
    commit_count = 0
    weekly_commits = defaultdict(int)
    
    for commit in commits:
        commit_count += 1
        week = commit.commit.author.date.isocalendar()[1]
        weekly_commits[week] += 1
    
    # Calculate commit frequency
    commit_frequency = commit_count / 7  # Average per day
    
    # Fetch code frequency (additions/deletions)
    code_freq = repo.get_stats_code_frequency()
    code_frequency = {
        'additions': [stat.additions for stat in code_freq],
        'deletions': [stat.deletions for stat in code_freq]
    } if code_freq else {}
    
    # Check community health files
    try:
        community = repo.get_community_profile()
        contributing_exists = community.files.contributing is not None
        coc_exists = community.files.code_of_conduct is not None
        issue_template_exists = community.files.issue_template is not None
        pr_template_exists = community.files.pull_request_template is not None
    except:
        contributing_exists = coc_exists = issue_template_exists = pr_template_exists = False
    
    # Fetch language distribution
    languages = repo.get_languages()
    
    # Calculate growth rates
    star_history = repo.get_stargazers_with_dates()
    star_counts = defaultdict(int)
    for star in star_history:
        week = star.starred_at.isocalendar()[1]
        star_counts[week] += 1
    
    star_growth_rate = sum(star_counts.values()) / len(star_counts) if star_counts else 0
    
    # Update repository with new metrics
    repository.commit_count = commit_count
    repository.commit_frequency = commit_frequency
    repository.code_frequency = code_frequency
    repository.contributing_guidelines = contributing_exists
    repository.code_of_conduct = coc_exists
    repository.issue_template = issue_template_exists
    repository.pr_template = pr_template_exists
    repository.languages = languages
    repository.star_growth_rate = star_growth_rate
    
    # Calculate issue resolution rate
    if closed_issues_count + open_issues_count > 0:
        repository.issue_resolution_rate = (closed_issues_count / (closed_issues_count + open_issues_count)) * 100
    
    # Calculate PR merge rate
    if merged_pr_count + unmerged_pr_count > 0:
        repository.pr_merge_rate = (merged_pr_count / (merged_pr_count + unmerged_pr_count)) * 100
    
    repository.save()

    print(f"Updated repository metrics for {repository.name}")
