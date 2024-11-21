# from celery import shared_task, group
# from github import Github, GithubException
# from datetime import timedelta
# from django.utils.timezone import make_aware, is_aware, now
# from .models import Repository, Contributor, RepositoryContributor, Issue, PullRequest, Comment
# from transformers import pipeline
# from django.core.cache import cache
# import os
# from statistics import median
# from collections import Counter

# def ensure_aware(dt):
#     """
#     Ensure that the datetime object is timezone-aware.
#     If it's naive, make it aware. If it's already aware, return as is.
#     """
#     if dt and not is_aware(dt):
#         return make_aware(dt)
#     return dt

# @shared_task
# def fetch_repository_data(repo_full_name):
#     print(f"Fetching data for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     if not token:
#         print("GitHub token not found!")
#         return

#     try:
#         github_client = Github(token)
#         repo = github_client.get_repo(repo_full_name)
#     except GithubException as e:
#         print(f"Failed to fetch repository data: {e}")
#         return

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

#     tasks = group(
#         fetch_contributors_data.s(repo_full_name, repository.id),
#         fetch_issues_data.s(repo_full_name, repository.id),
#         fetch_pull_requests_data.s(repo_full_name, repository.id),
#         fetch_comments_data.s(repo_full_name, repository.id),
#         fetch_additional_metrics.s(repo_full_name, repository.id),
#     )

#     tasks.apply_async()
#     print(f"Initiated data fetching tasks for {repository.name}")

# def file_exists_in_repo(repo, file_path):
#     """
#     Check if a specific file exists in the given repository.
#     Handles GitHub API exceptions gracefully.
#     """
#     try:
#         # Attempt to fetch the file
#         repo.get_contents(file_path)
#         return True
#     except GithubException as e:
#         # Log the specific error for debugging
#         if e.status == 404:
#             print(f"File {file_path} not found in repository {repo.full_name}.")
#         elif e.status == 403:
#             print(f"Access denied to {file_path} in repository {repo.full_name}.")
#         else:
#             print(f"Unexpected error for {file_path} in repository {repo.full_name}: {e}")
#         return False


# @shared_task
# def fetch_contributors_data(repo_full_name, repository_id):
#     print(f"Fetching contributors for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)

#     # Check cache
#     cache_key = f"contributors_{repo_full_name}"
#     contributors_data = cache.get(cache_key)

#     if contributors_data is None:
#         try:
#             github_client = Github(token)
#             repo = github_client.get_repo(repo_full_name)
#             contributors = repo.get_contributors()
#             contributors_data = [(contributor.login, contributor.contributions) for contributor in contributors]
#             # Cache the contributors data for 6 hours
#             cache.set(cache_key, contributors_data, 6 * 3600)
#         except GithubException as e:
#             print(f"Error fetching contributors: {e}")
#             return
#     else:
#         print("Loaded contributors from cache.")

#     contributor_contributions = []
#     for username, contributions in contributors_data:
#         contrib_obj, _ = Contributor.objects.update_or_create(
#             username=username,
#             defaults={'total_contributions': contributions}
#         )
#         RepositoryContributor.objects.update_or_create(
#             repository=repository,
#             contributor=contrib_obj,
#             defaults={'contributions': contributions}
#         )
#         contributor_contributions.append((username, contributions))

#     if contributor_contributions:
#         contributor_contributions.sort(key=lambda x: x[1], reverse=True)
#         top_contributors = contributor_contributions[:5]
#         repository.top_contributors = ', '.join([login for login, _ in top_contributors])
#     else:
#         repository.top_contributors = ''
#         print(f"No contributors found for {repository.name}")

#     repository.save()
#     print(f"Updated contributors for {repository.name}")

# @shared_task
# def fetch_issues_data(repo_full_name, repository_id):
#     print(f"Fetching issues for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)
#     since_date = now() - timedelta(days=90)  # Adjust as needed

#     # Check cache
#     cache_key = f"issues_{repo_full_name}"
#     issues_data = cache.get(cache_key)

#     if issues_data is None:
#         try:
#             github_client = Github(token)
#             repo = github_client.get_repo(repo_full_name)
#             issues = repo.get_issues(state='all', since=since_date)
#             issues_data = []
#             for issue in issues:
#                 if issue.pull_request:
#                     continue
#                 issues_data.append({
#                     'number': issue.number,
#                     'title': issue.title,
#                     'body': issue.body,
#                     'state': issue.state,
#                     'created_at': ensure_aware(issue.created_at),
#                     'closed_at': ensure_aware(issue.closed_at) if issue.closed_at else None,
#                     'comments': issue.comments,
#                 })
#             # Cache the issues data for 1 hour
#             cache.set(cache_key, issues_data, 3600)
#         except GithubException as e:
#             print(f"Error fetching issues: {e}")
#             return
#     else:
#         print("Loaded issues from cache.")

#     closed_issues_count = 0
#     open_issues_count = 0
#     total_issue_close_time = timedelta(0)
#     issue_response_times = []

#     for issue_data in issues_data:
#         issue_number = issue_data['number']
#         # Calculate first response time
#         first_response_time = None
#         if issue_data['comments'] > 0:
#             # Fetch comments for this issue
#             first_comment = None
#             cache_key_comment = f"issue_comments_{repo_full_name}_{issue_number}"
#             comments_data = cache.get(cache_key_comment)
#             if comments_data is None:
#                 try:
#                     github_client = Github(token)
#                     repo = github_client.get_repo(repo_full_name)
#                     issue = repo.get_issue(number=issue_number)
#                     comments = issue.get_comments()
#                     comments_data = [ensure_aware(comment.created_at) for comment in comments]
#                     cache.set(cache_key_comment, comments_data, 3600)
#                 except GithubException as e:
#                     print(f"Error fetching comments for issue #{issue_number}: {e}")
#                     comments_data = []
#             else:
#                 print(f"Loaded comments for issue #{issue_number} from cache.")

#             if comments_data:
#                 first_comment_time = comments_data[0]
#                 first_response_time = first_comment_time - issue_data['created_at']
#                 issue_response_times.append(first_response_time.total_seconds())

#         Issue.objects.update_or_create(
#             repository=repository,
#             issue_number=issue_number,
#             defaults={
#                 'title': issue_data['title'][:255],
#                 'body': issue_data['body'],
#                 'state': issue_data['state'][:50],
#                 'created_at': issue_data['created_at'],
#                 'closed_at': issue_data['closed_at'],
#                 'response_time': first_response_time,
#             }
#         )

#         if issue_data['state'] == 'closed' and issue_data['closed_at']:
#             closed_issues_count += 1
#             total_issue_close_time += (issue_data['closed_at'] - issue_data['created_at'])
#         else:
#             open_issues_count += 1

#     avg_issue_close_time = (
#         total_issue_close_time / closed_issues_count if closed_issues_count > 0 else None
#     )

#     # Calculate median issue response time
#     if issue_response_times:
#         median_response_time = timedelta(seconds=median(issue_response_times))
#     else:
#         median_response_time = None

#     # Calculate issue resolution rate
#     total_issues = closed_issues_count + open_issues_count
#     if total_issues > 0:
#         issue_resolution_rate = (closed_issues_count / total_issues) * 100
#     else:
#         issue_resolution_rate = 0

#     repository.avg_issue_close_time = avg_issue_close_time
#     repository.open_issues_count = open_issues_count
#     repository.closed_issues_count = closed_issues_count
#     repository.median_issue_response_time = median_response_time
#     repository.issue_resolution_rate = issue_resolution_rate
#     repository.save()
#     print(f"Updated issues data for {repository.name}")

# @shared_task
# def fetch_pull_requests_data(repo_full_name, repository_id):
#     print(f"Fetching pull requests for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     if not token:
#         print("GitHub token not found!")
#         return

#     repository = Repository.objects.get(id=repository_id)
#     since_date = now() - timedelta(days=90)  # Adjust as needed

#     # Check cache
#     cache_key = f"pull_requests_{repo_full_name}"
#     prs_data = cache.get(cache_key)

#     if prs_data is None:
#         prs_data = []
#         try:
#             github_client = Github(token)
#             repo = github_client.get_repo(repo_full_name)

#             # Fetch pull requests with pagination
#             pulls = repo.get_pulls(state='all')
#             for pull_request in pulls:
#                 # Break early if the PR is older than the `since_date`
#                 if ensure_aware(pull_request.created_at) < since_date:
#                     break
#                 prs_data.append({
#                     'number': pull_request.number,
#                     'title': pull_request.title,
#                     'body': pull_request.body,
#                     'state': pull_request.state,
#                     'created_at': ensure_aware(pull_request.created_at),
#                     'merged_at': ensure_aware(pull_request.merged_at) if pull_request.merged_at else None,
#                     'merged': pull_request.is_merged(),
#                     'comments': pull_request.comments,
#                 })

#             # Cache the PRs data for 1 hour
#             cache.set(cache_key, prs_data, 3600)
#         except GithubException as e:
#             print(f"Error fetching pull requests: {e}")
#             return
#     else:
#         print("Loaded pull requests from cache.")

#     merged_pr_count = 0
#     unmerged_pr_count = 0
#     total_pr_merge_time = timedelta(0)
#     pr_response_times = []

#     for pr_data in prs_data:
#         pr_number = pr_data['number']
#         first_response_time = None

#         if pr_data['comments'] > 0:
#             # Fetch comments for this PR
#             cache_key_comment = f"pr_comments_{repo_full_name}_{pr_number}"
#             comments_data = cache.get(cache_key_comment)

#             if comments_data is None:
#                 try:
#                     github_client = Github(token)
#                     repo = github_client.get_repo(repo_full_name)
#                     pull_request = repo.get_pull(number=pr_number)
#                     comments = pull_request.get_issue_comments()
#                     comments_data = [ensure_aware(comment.created_at) for comment in comments]
#                     cache.set(cache_key_comment, comments_data, 3600)
#                 except GithubException as e:
#                     print(f"Error fetching comments for PR #{pr_number}: {e}")
#                     comments_data = []

#             if comments_data:
#                 first_comment_time = comments_data[0]
#                 first_response_time = first_comment_time - pr_data['created_at']
#                 pr_response_times.append(first_response_time.total_seconds())

#         PullRequest.objects.update_or_create(
#             repository=repository,
#             pr_number=pr_number,
#             defaults={
#                 'title': pr_data['title'][:255],
#                 'body': pr_data['body'],
#                 'state': pr_data['state'][:50],
#                 'merged': pr_data['merged'],
#                 'created_at': pr_data['created_at'],
#                 'merged_at': pr_data['merged_at'],
#                 'response_time': first_response_time,
#             }
#         )

#         if pr_data['merged'] and pr_data['merged_at']:
#             merged_pr_count += 1
#             total_pr_merge_time += (pr_data['merged_at'] - pr_data['created_at'])
#         else:
#             unmerged_pr_count += 1

#     avg_pr_merge_time = (
#         total_pr_merge_time / merged_pr_count if merged_pr_count > 0 else None
#     )

#     # Calculate median PR response time
#     if pr_response_times:
#         median_response_time = timedelta(seconds=median(pr_response_times))
#     else:
#         median_response_time = None

#     # Calculate PR merge rate
#     total_prs = merged_pr_count + unmerged_pr_count
#     if total_prs > 0:
#         pr_merge_rate = (merged_pr_count / total_prs) * 100
#     else:
#         pr_merge_rate = 0

#     repository.avg_pr_merge_time = avg_pr_merge_time
#     repository.merged_pr_count = merged_pr_count
#     repository.unmerged_pr_count = unmerged_pr_count
#     repository.median_pr_response_time = median_response_time
#     repository.pr_merge_rate = pr_merge_rate
#     repository.save()
#     print(f"Updated pull requests data for {repository.name}")


# @shared_task
# def fetch_comments_data(repo_full_name, repository_id):
#     print(f"Fetching comments for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)
#     since_date = now() - timedelta(days=90)  # Adjust as needed

#     # Check cache
#     cache_key = f"comments_{repo_full_name}"
#     comments_data = cache.get(cache_key)

#     if comments_data is None:
#         try:
#             github_client = Github(token)
#             repo = github_client.get_repo(repo_full_name)
#             comments = repo.get_issues_comments(since=since_date)
#             comments_data = []
#             for comment in comments:
#                 comments_data.append({
#                     'author': comment.user.login,
#                     'body': comment.body,
#                     'created_at': ensure_aware(comment.created_at),
#                     'issue_number': comment.issue_url.split('/')[-1],
#                 })
#             # Cache the comments data for 1 hour
#             cache.set(cache_key, comments_data, 3600)
#         except GithubException as e:
#             print(f"Error fetching comments: {e}")
#             return
#     else:
#         print("Loaded comments from cache.")

#     if not comments_data:
#         print(f"No comments found for {repository.name}")
#         repository.positive_comment_percentage = 0
#         repository.negative_comment_percentage = 0
#         repository.neutral_comment_percentage = 0
#         repository.save()
#         return

#     # Initialize sentiment analysis pipeline
#     sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
#     total_comments = len(comments_data)
#     positive_comments = 0
#     negative_comments = 0
#     neutral_comments = 0

#     for comment_data in comments_data:
#         # Analyze sentiment
#         try:
#             sentiment_result = sentiment_analyzer(comment_data['body'][:512])[0]
#             sentiment = sentiment_result['label']
#             if '5' in sentiment or '4' in sentiment:
#                 positive_comments += 1
#                 sentiment_label = 'positive'
#             elif '1' in sentiment or '2' in sentiment:
#                 negative_comments += 1
#                 sentiment_label = 'negative'
#             else:
#                 neutral_comments += 1
#                 sentiment_label = 'neutral'
#         except Exception as e:
#             print(f"Error analyzing sentiment: {e}")
#             sentiment_label = 'neutral'
#             neutral_comments += 1

#         # Save comment to database
#         Comment.objects.update_or_create(
#             repository=repository,
#             author=comment_data['author'],
#             body=comment_data['body'],
#             created_at=comment_data['created_at'],
#             content_type='issue',  # Assuming issue comments
#             object_id=comment_data['issue_number'],
#             defaults={
#                 'sentiment': sentiment_label
#             }
#         )

#     # Calculate percentages
#     if total_comments > 0:
#         positive_comment_percentage = (positive_comments / total_comments) * 100
#         negative_comment_percentage = (negative_comments / total_comments) * 100
#         neutral_comment_percentage = (neutral_comments / total_comments) * 100
#     else:
#         positive_comment_percentage = negative_comment_percentage = neutral_comment_percentage = 0

#     # Update repository sentiment metrics
#     repository.positive_comment_percentage = positive_comment_percentage
#     repository.negative_comment_percentage = negative_comment_percentage
#     repository.neutral_comment_percentage = neutral_comment_percentage
#     repository.save()
#     print(f"Updated comments data for {repository.name}")

# @shared_task
# def fetch_additional_metrics(repo_full_name, repository_id):
#     print(f"Fetching additional metrics for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)
#     since_date = now() - timedelta(days=90)

#     try:
#         github_client = Github(token)
#         repo = github_client.get_repo(repo_full_name)
#     except GithubException as e:
#         print(f"Error accessing repository: {e}")
#         return

#     # Initialize variables with defaults
#     commit_count = 0
#     commit_frequency = 0.0
#     code_frequency = {}
#     languages = {}
#     star_growth_rate = 0.0
#     contributing_guidelines = False
#     code_of_conduct = False
#     issue_template = False
#     pr_template = False

#     # Fetch commit statistics
#     try:
#         cache_key = f"commits_{repo_full_name}"
#         commit_count = cache.get(cache_key)

#         if commit_count is None:
#             commits = repo.get_commits(since=since_date)
#             commit_count = commits.totalCount
#             cache.set(cache_key, commit_count, 3600)
#         else:
#             print("Loaded commit count from cache.")

#         commit_frequency = commit_count / 90.0
#     except GithubException as e:
#         print(f"Error fetching commits: {e}")
#     except Exception as e:
#         print(f"Unexpected error in commit statistics: {e}")

#     # Fetch code frequency
#     try:
#         cache_key = f"code_frequency_{repo_full_name}"
#         code_frequency = cache.get(cache_key)

#         if code_frequency is None:
#             code_freq_stats = repo.get_stats_code_frequency()
#             if code_freq_stats:
#                 code_frequency = {
#                     'weeks': [ensure_aware(stat.week).isoformat() for stat in code_freq_stats],
#                     'additions': [stat.additions for stat in code_freq_stats],
#                     'deletions': [stat.deletions for stat in code_freq_stats],
#                 }
#                 cache.set(cache_key, code_frequency, 24 * 3600)
#         else:
#             print("Loaded code frequency from cache.")
#     except GithubException as e:
#         print(f"Error fetching code frequency: {e}")
#     except Exception as e:
#         print(f"Unexpected error in code frequency: {e}")

#     # Fetch language distribution
#     try:
#         cache_key = f"languages_{repo_full_name}"
#         languages = cache.get(cache_key)

#         if languages is None:
#             languages = repo.get_languages()
#             cache.set(cache_key, languages, 24 * 3600)
#         else:
#             print("Loaded languages from cache.")
#     except GithubException as e:
#         print(f"Error fetching languages: {e}")
#     except Exception as e:
#         print(f"Unexpected error in languages: {e}")

#     # Calculate star growth rate
#     try:
#         cache_key = f"star_growth_{repo_full_name}"
#         star_growth_rate = cache.get(cache_key)

#         if star_growth_rate is None:
#             star_history = repo.get_stargazers_with_dates()
#             star_counts = sum(1 for star in star_history if ensure_aware(star.starred_at) >= since_date)
#             star_growth_rate = star_counts / 90.0
#             cache.set(cache_key, star_growth_rate, 24 * 3600)
#         else:
#             print("Loaded star growth rate from cache.")
#     except GithubException as e:
#         print(f"Error fetching stargazers: {e}")
#     except Exception as e:
#         print(f"Unexpected error in star growth rate: {e}")

#     # Check for contributing guidelines
#     try:
#         contributing_files = [
#             'CONTRIBUTING', 'CONTRIBUTING.md', 'docs/CONTRIBUTING.md', '.github/CONTRIBUTING.md'
#         ]
#         contributing_guidelines = any(file_exists_in_repo(repo, path) for path in contributing_files)
#     except GithubException as e:
#         print(f"Error checking contributing guidelines: {e}")
#     except Exception as e:
#         print(f"Unexpected error in contributing guidelines: {e}")

#     # Check for code of conduct
#     try:
#         code_of_conduct_files = [
#             'CODE_OF_CONDUCT', 'CODE_OF_CONDUCT.md', 'docs/CODE_OF_CONDUCT.md', '.github/CODE_OF_CONDUCT.md'
#         ]
#         code_of_conduct = any(file_exists_in_repo(repo, path) for path in code_of_conduct_files)
#     except GithubException as e:
#         print(f"Error checking code of conduct: {e}")
#     except Exception as e:
#         print(f"Unexpected error in code of conduct: {e}")

#     # Check for issue templates
#     try:
#         issue_template_files = ['.github/ISSUE_TEMPLATE.md', '.github/ISSUE_TEMPLATE/']
#         issue_template = any(file_exists_in_repo(repo, path) for path in issue_template_files)
#     except GithubException as e:
#         print(f"Error checking issue template: {e}")
#     except Exception as e:
#         print(f"Unexpected error in issue template: {e}")

#     # Check for PR templates
#     try:
#         pr_template_files = ['.github/PULL_REQUEST_TEMPLATE.md', '.github/PULL_REQUEST_TEMPLATE/']
#         pr_template = any(file_exists_in_repo(repo, path) for path in pr_template_files)
#     except GithubException as e:
#         print(f"Error checking PR template: {e}")
#     except Exception as e:
#         print(f"Unexpected error in PR template: {e}")

#     # Update repository with gathered metrics
#     try:
#         repository.commit_count = commit_count
#         repository.commit_frequency = commit_frequency
#         repository.code_frequency = code_frequency
#         repository.languages = languages
#         repository.star_growth_rate = star_growth_rate
#         repository.contributing_guidelines = contributing_guidelines
#         repository.code_of_conduct = code_of_conduct
#         repository.issue_template = issue_template
#         repository.pr_template = pr_template
#         repository.save()
#         print(f"Updated additional metrics for {repository.name}")
#     except Exception as e:
#         print(f"Error saving repository metrics: {e}")



# from celery import shared_task, group
# from github import Github, GithubException
# from datetime import timedelta
# from django.utils.timezone import make_aware, is_aware, now
# from .models import Repository, Contributor, RepositoryContributor, Issue, PullRequest, Comment
# from transformers import pipeline
# from django.core.cache import cache
# import os
# from statistics import median
# from collections import Counter


# def ensure_aware(dt):
#     """
#     Ensure that the datetime object is timezone-aware.
#     If it's naive, make it aware. If it's already aware, return as is.
#     """
#     if dt and not is_aware(dt):
#         return make_aware(dt)
#     return dt


# def file_exists_in_repo(repo, file_path):
#     """
#     Check if a specific file exists in the given repository.
#     Handles GitHub API exceptions gracefully.
#     """
#     try:
#         repo.get_contents(file_path)
#         return True
#     except GithubException as e:
#         if e.status == 404:
#             return False
#         raise e


# @shared_task
# def fetch_repository_data(repo_full_name):
#     print(f"Fetching data for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     if not token:
#         print("GitHub token not found!")
#         return

#     try:
#         github_client = Github(token)
#         repo = github_client.get_repo(repo_full_name)
#     except GithubException as e:
#         print(f"Failed to fetch repository data: {e}")
#         return

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

#     tasks = group(
#         fetch_contributors_data.s(repo_full_name, repository.id),
#         fetch_issues_data.s(repo_full_name, repository.id),
#         fetch_pull_requests_data.s(repo_full_name, repository.id),
#         fetch_comments_data.s(repo_full_name, repository.id),
#         fetch_additional_metrics.s(repo_full_name, repository.id),
#     )

#     tasks.apply_async()
#     print(f"Initiated data fetching tasks for {repository.name}")


# @shared_task
# def fetch_contributors_data(repo_full_name, repository_id):
#     print(f"Fetching contributors for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)

#     # Check cache
#     cache_key = f"contributors_{repo_full_name}"
#     contributors_data = cache.get(cache_key)

#     if contributors_data is None:
#         try:
#             github_client = Github(token)
#             repo = github_client.get_repo(repo_full_name)
#             contributors = repo.get_contributors()
#             contributors_data = [(contributor.login, contributor.contributions) for contributor in contributors]
#             cache.set(cache_key, contributors_data, 6 * 3600)
#         except GithubException as e:
#             print(f"Error fetching contributors: {e}")
#             return

#     contributor_contributions = []
#     for username, contributions in contributors_data:
#         contrib_obj, _ = Contributor.objects.update_or_create(
#             username=username,
#             defaults={'total_contributions': contributions}
#         )
#         RepositoryContributor.objects.update_or_create(
#             repository=repository,
#             contributor=contrib_obj,
#             defaults={'contributions': contributions}
#         )
#         contributor_contributions.append((username, contributions))

#     if contributor_contributions:
#         contributor_contributions.sort(key=lambda x: x[1], reverse=True)
#         top_contributors = contributor_contributions[:5]
#         repository.top_contributors = ', '.join([login for login, _ in top_contributors])
#     else:
#         repository.top_contributors = ''

#     repository.save()
#     print(f"Updated contributors for {repository.name}")


# @shared_task
# def fetch_issues_data(repo_full_name, repository_id):
#     print(f"Fetching issues for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)
#     since_date = now() - timedelta(days=90)

#     # Check cache
#     cache_key = f"issues_{repo_full_name}"
#     issues_data = cache.get(cache_key)

#     if issues_data is None:
#         try:
#             github_client = Github(token)
#             repo = github_client.get_repo(repo_full_name)
#             issues = repo.get_issues(state='all', since=since_date)
#             issues_data = [
#                 {
#                     'number': issue.number,
#                     'title': issue.title,
#                     'body': issue.body,
#                     'state': issue.state,
#                     'created_at': ensure_aware(issue.created_at),
#                     'closed_at': ensure_aware(issue.closed_at) if issue.closed_at else None,
#                     'comments': issue.comments,
#                 }
#                 for issue in issues if not issue.pull_request
#             ]
#             cache.set(cache_key, issues_data, 3600)
#         except GithubException as e:
#             print(f"Error fetching issues: {e}")
#             return

#     closed_issues_count = 0
#     open_issues_count = 0
#     total_issue_close_time = timedelta(0)
#     issue_response_times = []

#     for issue_data in issues_data:
#         if issue_data['state'] == 'closed' and issue_data['closed_at']:
#             closed_issues_count += 1
#             total_issue_close_time += (issue_data['closed_at'] - issue_data['created_at'])
#         else:
#             open_issues_count += 1

#     avg_issue_close_time = (
#         total_issue_close_time / closed_issues_count if closed_issues_count > 0 else None
#     )
#     repository.avg_issue_close_time = avg_issue_close_time
#     repository.open_issues_count = open_issues_count
#     repository.closed_issues_count = closed_issues_count
#     repository.save()
#     print(f"Updated issues data for {repository.name}")


# @shared_task
# def fetch_pull_requests_data(repo_full_name, repository_id):
#     print(f"Fetching pull requests for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)
#     since_date = now() - timedelta(days=90)

#     # Check cache
#     cache_key = f"pull_requests_{repo_full_name}"
#     prs_data = cache.get(cache_key)

#     if prs_data is None:
#         prs_data = []
#         try:
#             github_client = Github(token)
#             repo = github_client.get_repo(repo_full_name)
#             pulls = repo.get_pulls(state='all')
#             for pr in pulls:
#                 if ensure_aware(pr.created_at) < since_date:
#                     break
#                 prs_data.append({
#                     'number': pr.number,
#                     'title': pr.title,
#                     'body': pr.body,
#                     'state': pr.state,
#                     'created_at': ensure_aware(pr.created_at),
#                     'merged_at': ensure_aware(pr.merged_at) if pr.merged_at else None,
#                     'merged': pr.is_merged(),
#                     'comments': pr.comments,
#                 })
#             cache.set(cache_key, prs_data, 3600)
#         except GithubException as e:
#             print(f"Error fetching pull requests: {e}")
#             return

#     repository.merged_pr_count = sum(1 for pr in prs_data if pr['merged'])
#     repository.unmerged_pr_count = len(prs_data) - repository.merged_pr_count
#     repository.save()
#     print(f"Updated pull requests data for {repository.name}")


# @shared_task
# def fetch_additional_metrics(repo_full_name, repository_id):
#     print(f"Fetching additional metrics for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)
#     since_date = now() - timedelta(days=90)

#     try:
#         github_client = Github(token)
#         repo = github_client.get_repo(repo_full_name)
#     except GithubException as e:
#         print(f"Error accessing repository: {e}")
#         return

#     commit_count = cache.get(f"commits_{repo_full_name}", 0)
#     if not commit_count:
#         try:
#             commits = repo.get_commits(since=since_date)
#             commit_count = commits.totalCount
#             cache.set(f"commits_{repo_full_name}", commit_count, 3600)
#         except GithubException as e:
#             print(f"Error fetching commits: {e}")

#     code_frequency = cache.get(f"code_frequency_{repo_full_name}", {})
#     if not code_frequency and commit_count < 10000:
#         try:
#             stats = repo.get_stats_code_frequency()
#             code_frequency = {
#                 'weeks': [ensure_aware(stat.week).isoformat() for stat in stats],
#                 'additions': [stat.additions for stat in stats],
#                 'deletions': [stat.deletions for stat in stats],
#             }
#             cache.set(f"code_frequency_{repo_full_name}", code_frequency, 3600)
#         except GithubException:
#             code_frequency = {}

#     repository.commit_count = commit_count
#     repository.code_frequency = code_frequency
#     repository.save()
#     print(f"Updated additional metrics for {repository.name}")

# @shared_task
# def fetch_comments_data(repo_full_name, repository_id):
#     """
#     Fetch comments for a repository and calculate sentiment metrics.
#     """
#     print(f"Fetching comments for repository: {repo_full_name}")
#     token = os.getenv("GITHUB_TOKEN")
#     repository = Repository.objects.get(id=repository_id)
#     since_date = now() - timedelta(days=90)  # Adjust as needed

#     # Check cache
#     cache_key = f"comments_{repo_full_name}"
#     comments_data = cache.get(cache_key)

#     if comments_data is None:
#         try:
#             github_client = Github(token)
#             repo = github_client.get_repo(repo_full_name)
#             comments = repo.get_issues_comments(since=since_date)
#             comments_data = []
#             for comment in comments:
#                 comments_data.append({
#                     'author': comment.user.login,
#                     'body': comment.body,
#                     'created_at': ensure_aware(comment.created_at),
#                     'issue_number': comment.issue_url.split('/')[-1],
#                 })
#             # Cache the comments data for 1 hour
#             cache.set(cache_key, comments_data, 3600)
#         except GithubException as e:
#             print(f"Error fetching comments: {e}")
#             return
#     else:
#         print("Loaded comments from cache.")

#     if not comments_data:
#         print(f"No comments found for {repository.name}")
#         repository.positive_comment_percentage = 0
#         repository.negative_comment_percentage = 0
#         repository.neutral_comment_percentage = 0
#         repository.save()
#         return

#     # Initialize sentiment analysis pipeline
#     sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")
#     total_comments = len(comments_data)
#     positive_comments = 0
#     negative_comments = 0
#     neutral_comments = 0

#     for comment_data in comments_data:
#         # Analyze sentiment
#         try:
#             sentiment_result = sentiment_analyzer(comment_data['body'][:512])[0]
#             sentiment = sentiment_result['label']
#             if '5' in sentiment or '4' in sentiment:
#                 positive_comments += 1
#                 sentiment_label = 'positive'
#             elif '1' in sentiment or '2' in sentiment:
#                 negative_comments += 1
#                 sentiment_label = 'negative'
#             else:
#                 neutral_comments += 1
#                 sentiment_label = 'neutral'
#         except Exception as e:
#             print(f"Error analyzing sentiment: {e}")
#             sentiment_label = 'neutral'
#             neutral_comments += 1

#         # Save comment to database
#         Comment.objects.update_or_create(
#             repository=repository,
#             author=comment_data['author'],
#             body=comment_data['body'],
#             created_at=comment_data['created_at'],
#             content_type='issue',  # Assuming issue comments
#             object_id=comment_data['issue_number'],
#             defaults={
#                 'sentiment': sentiment_label
#             }
#         )

#     # Calculate percentages
#     if total_comments > 0:
#         positive_comment_percentage = (positive_comments / total_comments) * 100
#         negative_comment_percentage = (negative_comments / total_comments) * 100
#         neutral_comment_percentage = (neutral_comments / total_comments) * 100
#     else:
#         positive_comment_percentage = negative_comment_percentage = neutral_comment_percentage = 0

#     # Update repository sentiment metrics
#     repository.positive_comment_percentage = positive_comment_percentage
#     repository.negative_comment_percentage = negative_comment_percentage
#     repository.neutral_comment_percentage = neutral_comment_percentage
#     repository.save()
#     print(f"Updated comments data for {repository.name}")


from celery import shared_task, group
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

    tasks = group(
        fetch_contributors_data.s(repo_full_name, repository.id),
        fetch_issues_data.s(repo_full_name, repository.id),
        fetch_pull_requests_data.s(repo_full_name, repository.id),
        fetch_comments_data.s(repo_full_name, repository.id),
        fetch_additional_metrics.s(repo_full_name, repository.id),
    )

    tasks.apply_async()
    print(f"Initiated data fetching tasks for {repository.name}")

@shared_task
def fetch_contributors_data(repo_full_name, repository_id):
    print(f"Fetching contributors for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)
    github_client = Github(token)

    # Check cache
    cache_key = f"contributors_{repo_full_name}"
    contributors_data = cache.get(cache_key)

    if contributors_data is None:
        try:
            repo = github_client.get_repo(repo_full_name)
            contributors = repo.get_contributors()
            contributors_data = [(contributor.login, contributor.contributions) for contributor in contributors]
            cache.set(cache_key, contributors_data, 6 * 3600)
        except RateLimitExceededException:
            handle_rate_limit(github_client)
            return fetch_contributors_data(repo_full_name, repository_id)
        except GithubException as e:
            print(f"Error fetching contributors: {e}")
            return

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
    print(f"Updated contributors for {repository.name}")

@shared_task
def fetch_issues_data(repo_full_name, repository_id):
    print(f"Fetching issues for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)
    since_date = now() - timedelta(days=90)
    github_client = Github(token)

    # Check cache
    cache_key = f"issues_{repo_full_name}"
    issues_data = cache.get(cache_key)

    if issues_data is None:
        try:
            repo = github_client.get_repo(repo_full_name)
            issues = repo.get_issues(state='all', since=since_date)
            issues_data = []
            for issue in issues:
                if issue.pull_request:
                    continue  # Skip pull requests
                issues_data.append({
                    'number': issue.number,
                    'title': issue.title,
                    'body': issue.body,
                    'state': issue.state,
                    'created_at': ensure_aware(issue.created_at),
                    'closed_at': ensure_aware(issue.closed_at) if issue.closed_at else None,
                    'comments': issue.comments,
                })
            cache.set(cache_key, issues_data, 3600)
        except RateLimitExceededException:
            handle_rate_limit(github_client)
            return fetch_issues_data(repo_full_name, repository_id)
        except GithubException as e:
            print(f"Error fetching issues: {e}")
            return

    closed_issues_count = 0
    open_issues_count = 0
    total_issue_close_time = timedelta(0)
    issue_close_times = []

    for issue_data in issues_data:
        # Create or update Issue objects
        issue_obj, created = Issue.objects.update_or_create(
            repository=repository,
            issue_number=issue_data['number'],
            defaults={
                'title': issue_data['title'],
                'body': issue_data['body'],
                'state': issue_data['state'],
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
    print(f"Updated issues data for {repository.name}")

@shared_task
def fetch_pull_requests_data(repo_full_name, repository_id):
    print(f"Fetching pull requests for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)
    since_date = now() - timedelta(days=90)
    github_client = Github(token)

    # Check cache
    cache_key = f"pull_requests_{repo_full_name}"
    prs_data = cache.get(cache_key)

    if prs_data is None:
        prs_data = []
        try:
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
                    'comments': pr.comments,
                })
            cache.set(cache_key, prs_data, 3600)
        except RateLimitExceededException:
            handle_rate_limit(github_client)
            return fetch_pull_requests_data(repo_full_name, repository_id)
        except GithubException as e:
            print(f"Error fetching pull requests: {e}")
            return

    merged_pr_count = 0
    unmerged_pr_count = 0
    total_pr_merge_time = timedelta(0)
    pr_merge_times = []

    for pr_data in prs_data:
        # Create or update PullRequest objects
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

    # Compute median PR merge time
    median_pr_merge_time = None
    if pr_merge_times:
        median_seconds = median(pr_merge_times)
        median_pr_merge_time = timedelta(seconds=median_seconds)

    # Compute PR merge rate
    total_prs = merged_pr_count + unmerged_pr_count
    pr_merge_rate = (merged_pr_count / total_prs) * 100 if total_prs > 0 else 0

    repository.merged_pr_count = merged_pr_count
    repository.unmerged_pr_count = unmerged_pr_count
    repository.avg_pr_merge_time = avg_pr_merge_time
    repository.median_pr_response_time = median_pr_merge_time
    repository.pr_merge_rate = pr_merge_rate
    repository.save()
    print(f"Updated pull requests data for {repository.name}")

@shared_task
def fetch_comments_data(repo_full_name, repository_id):
    """
    Fetch comments for a repository and calculate sentiment metrics.
    """
    print(f"Fetching comments for repository: {repo_full_name}")
    token = os.getenv("GITHUB_TOKEN")
    repository = Repository.objects.get(id=repository_id)
    since_date = now() - timedelta(days=90)  # Adjust as needed
    github_client = Github(token)

    # Check cache
    cache_key = f"comments_{repo_full_name}"
    comments_data = cache.get(cache_key)

    if comments_data is None:
        try:
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
        except RateLimitExceededException:
            handle_rate_limit(github_client)
            return fetch_comments_data(repo_full_name, repository_id)
        except GithubException as e:
            print(f"Error fetching comments: {e}")
            return
    else:
        print("Loaded comments from cache.")

    if not comments_data:
        print(f"No comments found for {repository.name}")
        repository.positive_comment_percentage = 0
        repository.negative_comment_percentage = 0
        repository.neutral_comment_percentage = 0
        repository.save()
        return

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
    github_client = Github(token)

    try:
        repo = github_client.get_repo(repo_full_name)
    except GithubException as e:
        print(f"Error accessing repository: {e}")
        return

    # Fetch commit count
    commit_count = cache.get(f"commits_{repo_full_name}")
    if commit_count is None:
        try:
            commits = repo.get_commits()
            # Check if the total count exceeds 10k
            if commits.totalCount > 10000:
                commit_count = "10k+"
            else:
                commit_count = commits.totalCount
            cache.set(f"commits_{repo_full_name}", commit_count, 3600)
        except RateLimitExceededException:
            handle_rate_limit(github_client)
            return fetch_additional_metrics(repo_full_name, repository_id)
        except GithubException as e:
            print(f"Error fetching commits: {e}")
            commit_count = 0

    # Compute commit frequency (e.g., commits per day over last 7 days)
    commit_frequency = cache.get(f"commit_frequency_{repo_full_name}")
    if commit_frequency is None:
        try:
            last_week = now() - timedelta(days=7)
            recent_commits = repo.get_commits(since=last_week)
            commit_frequency = recent_commits.totalCount / 7  # Average commits per day
            cache.set(f"commit_frequency_{repo_full_name}", commit_frequency, 3600)
        except RateLimitExceededException:
            handle_rate_limit(github_client)
            return fetch_additional_metrics(repo_full_name, repository_id)
        except GithubException as e:
            print(f"Error fetching recent commits: {e}")
            commit_frequency = 0

    # Fetch code frequency
    code_frequency = cache.get(f"code_frequency_{repo_full_name}")
    if code_frequency is None:
        try:
            stats = repo.get_stats_code_frequency()
            if stats:
                code_frequency = {
                    'weeks': [ensure_aware(stat.week).isoformat() for stat in stats],
                    'additions': [stat.additions for stat in stats],
                    'deletions': [stat.deletions for stat in stats],
                }
            else:
                code_frequency = {}
            cache.set(f"code_frequency_{repo_full_name}", code_frequency, 3600)
        except RateLimitExceededException:
            handle_rate_limit(github_client)
            return fetch_additional_metrics(repo_full_name, repository_id)
        except GithubException as e:
            print(f"Error fetching code frequency: {e}")
            code_frequency = {}

    # Fetch languages
    languages = cache.get(f"languages_{repo_full_name}")
    if languages is None:
        try:
            languages = repo.get_languages()
            cache.set(f"languages_{repo_full_name}", languages, 3600)
        except RateLimitExceededException:
            handle_rate_limit(github_client)
            return fetch_additional_metrics(repo_full_name, repository_id)
        except GithubException as e:
            print(f"Error fetching languages: {e}")
            languages = {}

    # Check for community health files
    try:
        contributing_guidelines = file_exists_in_repo(repo, 'CONTRIBUTING.md')
        code_of_conduct = file_exists_in_repo(repo, 'CODE_OF_CONDUCT.md')
        issue_template = (
            file_exists_in_repo(repo, '.github/ISSUE_TEMPLATE.md') or
            file_exists_in_repo(repo, '.github/ISSUE_TEMPLATE')
        )
        pr_template = (
            file_exists_in_repo(repo, '.github/PULL_REQUEST_TEMPLATE.md') or
            file_exists_in_repo(repo, '.github/PULL_REQUEST_TEMPLATE')
        )
    except RateLimitExceededException:
        handle_rate_limit(github_client)
        return fetch_additional_metrics(repo_full_name, repository_id)
    except GithubException as e:
        print(f"Error checking community health files: {e}")
        contributing_guidelines = code_of_conduct = issue_template = pr_template = False

    # Compute star growth rate
    star_growth_rate = 0
    try:
        stargazers = repo.get_stargazers_with_dates()
        stars_last_month = sum(1 for s in stargazers if s.starred_at and ensure_aware(s.starred_at) >= (now() - timedelta(days=30)))
        star_growth_rate = stars_last_month / 30  # Average stars per day
    except RateLimitExceededException:
        handle_rate_limit(github_client)
        return fetch_additional_metrics(repo_full_name, repository_id)
    except Exception as e:
        print(f"Error fetching stargazers: {e}")

    # Update repository
    repository.commit_count = commit_count
    repository.commit_frequency = commit_frequency
    repository.code_frequency = code_frequency
    repository.languages = languages
    repository.contributing_guidelines = contributing_guidelines
    repository.code_of_conduct = code_of_conduct
    repository.issue_template = issue_template
    repository.pr_template = pr_template
    repository.star_growth_rate = star_growth_rate

    repository.save()
    print(f"Updated additional metrics for {repository.name}")
