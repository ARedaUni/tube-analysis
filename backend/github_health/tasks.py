from celery import shared_task, group
from github import Github, GithubException
from datetime import timedelta
from django.utils.timezone import make_aware, is_aware, now
from .models import Repository, Contributor, RepositoryContributor, Issue, PullRequest, Comment
from transformers import pipeline
from django.core.cache import cache
import os
from statistics import median
from collections import Counter

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

    # Process contributors asynchronously
    fetch_contributors_data.delay(repo_full_name, repository.id)

    # Process issues asynchronously
    fetch_issues_data.delay(repo_full_name, repository.id)

    # Process pull requests asynchronously
    fetch_pull_requests_data.delay(repo_full_name, repository.id)

    # Process comments asynchronously
    fetch_comments_data.delay(repo_full_name, repository.id)

    # Process additional metrics asynchronously
    fetch_additional_metrics.delay(repo_full_name, repository.id)

    print(f"Initiated data fetching tasks for {repository.name}")

@shared_task
def fetch_contributors_data(repo_full_name, repository_id):
    print(f"Fetching contributors for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)

    # Check cache
    cache_key = f"contributors_{repo_full_name}"
    contributors_data = cache.get(cache_key)

    if contributors_data is None:
        try:
            github_client = Github(token)
            repo = github_client.get_repo(repo_full_name)
            contributors = repo.get_contributors()
            contributors_data = [(contributor.login, contributor.contributions) for contributor in contributors]
            # Cache the contributors data for 6 hours
            cache.set(cache_key, contributors_data, 6 * 3600)
        except GithubException as e:
            print(f"Error fetching contributors: {e}")
            return
    else:
        print("Loaded contributors from cache.")

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

    contributor_contributions.sort(key=lambda x: x[1], reverse=True)
    top_contributors = contributor_contributions[:5]
    repository.top_contributors = ', '.join([login for login, _ in top_contributors])
    repository.save()
    print(f"Updated contributors for {repository.name}")

@shared_task
def fetch_issues_data(repo_full_name, repository_id):
    print(f"Fetching issues for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)
    since_date = now() - timedelta(days=90)  # Adjust as needed

    # Check cache
    cache_key = f"issues_{repo_full_name}"
    issues_data = cache.get(cache_key)

    if issues_data is None:
        try:
            github_client = Github(token)
            repo = github_client.get_repo(repo_full_name)
            issues = repo.get_issues(state='all', since=since_date)
            issues_data = []
            for issue in issues:
                if issue.pull_request:
                    continue
                issues_data.append({
                    'number': issue.number,
                    'title': issue.title,
                    'body': issue.body,
                    'state': issue.state,
                    'created_at': ensure_aware(issue.created_at),
                    'closed_at': ensure_aware(issue.closed_at) if issue.closed_at else None,
                    'comments': issue.comments,
                })
            # Cache the issues data for 1 hour
            cache.set(cache_key, issues_data, 3600)
        except GithubException as e:
            print(f"Error fetching issues: {e}")
            return
    else:
        print("Loaded issues from cache.")

    closed_issues_count = 0
    open_issues_count = 0
    total_issue_close_time = timedelta(0)
    issue_response_times = []

    for issue_data in issues_data:
        issue_number = issue_data['number']
        # Calculate first response time
        first_response_time = None
        if issue_data['comments'] > 0:
            # Fetch comments for this issue
            first_comment = None
            cache_key_comment = f"issue_comments_{repo_full_name}_{issue_number}"
            comments_data = cache.get(cache_key_comment)
            if comments_data is None:
                try:
                    github_client = Github(token)
                    repo = github_client.get_repo(repo_full_name)
                    issue = repo.get_issue(number=issue_number)
                    comments = issue.get_comments()
                    comments_data = [ensure_aware(comment.created_at) for comment in comments]
                    cache.set(cache_key_comment, comments_data, 3600)
                except GithubException as e:
                    print(f"Error fetching comments for issue #{issue_number}: {e}")
                    comments_data = []
            else:
                print(f"Loaded comments for issue #{issue_number} from cache.")

            if comments_data:
                first_comment_time = comments_data[0]
                first_response_time = first_comment_time - issue_data['created_at']
                issue_response_times.append(first_response_time.total_seconds())

        Issue.objects.update_or_create(
            repository=repository,
            issue_number=issue_number,
            defaults={
                'title': issue_data['title'][:255],
                'body': issue_data['body'],
                'state': issue_data['state'][:50],
                'created_at': issue_data['created_at'],
                'closed_at': issue_data['closed_at'],
                'response_time': first_response_time,
            }
        )

        if issue_data['state'] == 'closed' and issue_data['closed_at']:
            closed_issues_count += 1
            total_issue_close_time += (issue_data['closed_at'] - issue_data['created_at'])
        else:
            open_issues_count += 1

    avg_issue_close_time = (
        total_issue_close_time / closed_issues_count if closed_issues_count > 0 else None
    )

    repository.avg_issue_close_time = avg_issue_close_time
    repository.open_issues_count = open_issues_count
    repository.closed_issues_count = closed_issues_count

    # Calculate median issue response time
    if issue_response_times:
        median_response_time = timedelta(seconds=median(issue_response_times))
    else:
        median_response_time = None

    repository.median_issue_response_time = median_response_time
    repository.save()
    print(f"Updated issues data for {repository.name}")

@shared_task
def fetch_pull_requests_data(repo_full_name, repository_id):
    print(f"Fetching pull requests for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)
    since_date = now() - timedelta(days=90)  # Adjust as needed

    # Check cache
    cache_key = f"pull_requests_{repo_full_name}"
    prs_data = cache.get(cache_key)

    if prs_data is None:
        try:
            github_client = Github(token)
            repo = github_client.get_repo(repo_full_name)
            pulls = repo.get_pulls(state='all')
            prs_data = []
            for pr in pulls:
                prs_data.append({
                    'number': pr.number,
                    'title': pr.title,
                    'body': pr.body,
                    'state': pr.state,
                    'created_at': ensure_aware(pr.created_at),
                    'merged_at': ensure_aware(pr.merged_at) if pr.merged_at else None,
                    'merged': pr.is_merged(),
                    'comments': pr.comments,
                })
            # Cache the PRs data for 1 hour
            cache.set(cache_key, prs_data, 3600)
        except GithubException as e:
            print(f"Error fetching pull requests: {e}")
            return
    else:
        print("Loaded pull requests from cache.")

    merged_pr_count = 0
    unmerged_pr_count = 0
    total_pr_merge_time = timedelta(0)
    pr_response_times = []

    for pr_data in prs_data:
        pr_number = pr_data['number']
        # Calculate first response time
        first_response_time = None
        if pr_data['comments'] > 0:
            # Fetch comments for this PR
            cache_key_comment = f"pr_comments_{repo_full_name}_{pr_number}"
            comments_data = cache.get(cache_key_comment)
            if comments_data is None:
                try:
                    github_client = Github(token)
                    repo = github_client.get_repo(repo_full_name)
                    pr = repo.get_pull(number=pr_number)
                    comments = pr.get_issue_comments()
                    comments_data = [ensure_aware(comment.created_at) for comment in comments]
                    cache.set(cache_key_comment, comments_data, 3600)
                except GithubException as e:
                    print(f"Error fetching comments for PR #{pr_number}: {e}")
                    comments_data = []
            else:
                print(f"Loaded comments for PR #{pr_number} from cache.")

            if comments_data:
                first_comment_time = comments_data[0]
                first_response_time = first_comment_time - pr_data['created_at']
                pr_response_times.append(first_response_time.total_seconds())

        PullRequest.objects.update_or_create(
            repository=repository,
            pr_number=pr_number,
            defaults={
                'title': pr_data['title'][:255],
                'body': pr_data['body'],
                'state': pr_data['state'][:50],
                'merged': pr_data['merged'],
                'created_at': pr_data['created_at'],
                'merged_at': pr_data['merged_at'],
                'response_time': first_response_time,
            }
        )

        if pr_data['merged'] and pr_data['merged_at']:
            merged_pr_count += 1
            total_pr_merge_time += (pr_data['merged_at'] - pr_data['created_at'])
        else:
            unmerged_pr_count += 1

    avg_pr_merge_time = (
        total_pr_merge_time / merged_pr_count if merged_pr_count > 0 else None
    )

    repository.avg_pr_merge_time = avg_pr_merge_time
    repository.merged_pr_count = merged_pr_count
    repository.unmerged_pr_count = unmerged_pr_count

    # Calculate median PR response time
    if pr_response_times:
        median_response_time = timedelta(seconds=median(pr_response_times))
    else:
        median_response_time = None

    repository.median_pr_response_time = median_response_time
    repository.save()
    print(f"Updated pull requests data for {repository.name}")

@shared_task
def fetch_comments_data(repo_full_name, repository_id):
    print(f"Fetching comments for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)
    since_date = now() - timedelta(days=90)  # Adjust as needed

    # Check cache
    cache_key = f"comments_{repo_full_name}"
    comments_data = cache.get(cache_key)

    if comments_data is None:
        try:
            github_client = Github(token)
            repo = github_client.get_repo(repo_full_name)
            comments = repo.get_issues_comments(since=since_date)
            comments_data = []
            for comment in comments:
                comments_data.append({
                    'author': comment.user.login,
                    'body': comment.body,
                    'created_at': ensure_aware(comment.created_at),
                    'issue_number': comment.issue_url.split('/')[-1],
                })
            # Cache the comments data for 1 hour
            cache.set(cache_key, comments_data, 3600)
        except GithubException as e:
            print(f"Error fetching comments: {e}")
            return
    else:
        print("Loaded comments from cache.")

    # Initialize sentiment analysis pipeline
    sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
    total_comments = len(comments_data)
    positive_comments = 0
    negative_comments = 0
    neutral_comments = 0

    for comment_data in comments_data:
        # Analyze sentiment
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

        # Save comment to database
        Comment.objects.update_or_create(
            repository=repository,
            author=comment_data['author'],
            body=comment_data['body'],
            created_at=comment_data['created_at'],
            content_type='issue',  # Assuming issue comments
            object_id=comment_data['issue_number'],
            defaults={
                'sentiment': sentiment_label
            }
        )

    # Calculate percentages
    if total_comments > 0:
        positive_comment_percentage = (positive_comments / total_comments) * 100
        negative_comment_percentage = (negative_comments / total_comments) * 100
        neutral_comment_percentage = (neutral_comments / total_comments) * 100
    else:
        positive_comment_percentage = negative_comment_percentage = neutral_comment_percentage = 0

    # Update repository sentiment metrics
    repository.positive_comment_percentage = positive_comment_percentage
    repository.negative_comment_percentage = negative_comment_percentage
    repository.neutral_comment_percentage = neutral_comment_percentage
    repository.save()
    print(f"Updated comments data for {repository.name}")

@shared_task
def fetch_additional_metrics(repo_full_name, repository_id):
    print(f"Fetching additional metrics for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)
    since_date = now() - timedelta(days=90)

    # Fetch commit statistics with caching
    cache_key = f"commits_{repo_full_name}"
    commit_count = cache.get(cache_key)

    if commit_count is None:
        try:
            github_client = Github(token)
            repo = github_client.get_repo(repo_full_name)
            commits = repo.get_commits(since=since_date)
            commit_count = commits.totalCount
            # Cache the commit count for 1 hour
            cache.set(cache_key, commit_count, 3600)
        except GithubException as e:
            print(f"Error fetching commits: {e}")
            commit_count = 0
    else:
        print("Loaded commit count from cache.")

    commit_frequency = commit_count / 90.0  # Average commits per day over the last 90 days

    # Fetch code frequency with caching
    cache_key = f"code_frequency_{repo_full_name}"
    code_frequency = cache.get(cache_key)

    if code_frequency is None:
        try:
            github_client = Github(token)
            repo = github_client.get_repo(repo_full_name)
            code_freq_stats = repo.get_stats_code_frequency()
            if code_freq_stats:
                code_frequency = {
                    'weeks': [ensure_aware(stat.week) for stat in code_freq_stats],
                    'additions': [stat.additions for stat in code_freq_stats],
                    'deletions': [stat.deletions for stat in code_freq_stats],
                }
                # Cache the code frequency for 24 hours
                cache.set(cache_key, code_frequency, 24 * 3600)
            else:
                code_frequency = {}
        except GithubException as e:
            print(f"Error fetching code frequency: {e}")
            code_frequency = {}
    else:
        print("Loaded code frequency from cache.")

    # Calculate star growth rate with caching
    cache_key = f"star_growth_{repo_full_name}"
    star_growth_rate = cache.get(cache_key)

    if star_growth_rate is None:
        try:
            github_client = Github(token)
            repo = github_client.get_repo(repo_full_name)
            star_history = repo.get_stargazers_with_dates()
            star_counts = sum(1 for star in star_history if ensure_aware(star.starred_at) >= since_date)
            star_growth_rate = star_counts / 90.0  # Average stars per day over the last 90 days
            # Cache the star growth rate for 24 hours
            cache.set(cache_key, star_growth_rate, 24 * 3600)
        except GithubException as e:
            print(f"Error fetching stargazers: {e}")
            star_growth_rate = 0
    else:
        print("Loaded star growth rate from cache.")

    # Update repository with new metrics
    repository.commit_count = commit_count
    repository.commit_frequency = commit_frequency
    repository.code_frequency = code_frequency
    repository.star_growth_rate = star_growth_rate
    repository.save()
    print(f"Updated additional metrics for {repository.name}")
