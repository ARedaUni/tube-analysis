# core/models.py

from django.db import models

class Repository(models.Model):
    name = models.CharField(max_length=255)
    owner = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    stars = models.IntegerField(default=0)
    forks = models.IntegerField(default=0)
    open_issues = models.IntegerField(default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    # New Fields
    avg_issue_close_time = models.DurationField(null=True, blank=True)
    avg_pr_merge_time = models.DurationField(null=True, blank=True)
    top_contributors = models.TextField(null=True, blank=True)
    open_issues_count = models.IntegerField(default=0)
    closed_issues_count = models.IntegerField(default=0)
    merged_pr_count = models.IntegerField(default=0)
    unmerged_pr_count = models.IntegerField(default=0)
    positive_comment_percentage = models.FloatField(default=0)
    negative_comment_percentage = models.FloatField(default=0)
    neutral_comment_percentage = models.FloatField(default=0)

    # Activity Metrics
    commit_count = models.IntegerField(default=0)
    commit_frequency = models.FloatField(default=0)  # Average commits per week
    code_frequency = models.JSONField(default=dict)  # Weekly additions/deletions
    
    # Community Health
    contributing_guidelines = models.BooleanField(default=False)
    code_of_conduct = models.BooleanField(default=False)
    issue_template = models.BooleanField(default=False)
    pr_template = models.BooleanField(default=False)
    
    # Code Quality
    languages = models.JSONField(default=dict)  # Language distribution
    dependencies = models.JSONField(default=dict)  # Project dependencies
    
    # Response Times
    median_issue_response_time = models.DurationField(null=True)
    median_pr_response_time = models.DurationField(null=True)
    
    # Issue Analytics
    issue_categories = models.JSONField(default=dict)  # Categorized issues
    issue_resolution_rate = models.FloatField(default=0)
    
    # PR Analytics
    pr_merge_rate = models.FloatField(default=0)
    pr_review_count = models.IntegerField(default=0)
    
    # Community Growth
    star_growth_rate = models.FloatField(default=0)
    fork_growth_rate = models.FloatField(default=0)
    contributor_growth_rate = models.FloatField(default=0)

    def __str__(self):
        return f"{self.owner}/{self.name}"

class Contributor(models.Model):
    username = models.CharField(max_length=255, unique=True)
    contributions = models.IntegerField(default=0)
    repositories = models.ManyToManyField(Repository, related_name='contributors')

    def __str__(self):
        return self.username

class Issue(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='issues')
    issue_number = models.IntegerField()
    title = models.CharField(max_length=255)
    body = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=50)  # e.g., 'open', 'closed'
    sentiment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField()
    closed_at = models.DateTimeField(null=True, blank=True)
    response_time = models.DurationField(null=True, blank=True)  # Add this field

    def __str__(self):
        return f"Issue #{self.issue_number}: {self.title}"

class PullRequest(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='pull_requests')
    pr_number = models.IntegerField()
    title = models.CharField(max_length=255)
    body = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=50)  # e.g., 'open', 'closed'
    merged = models.BooleanField(default=False)
    created_at = models.DateTimeField()
    merged_at = models.DateTimeField(null=True, blank=True)
    response_time = models.DurationField(null=True, blank=True)  # Add this field

    def __str__(self):
        return f"PR #{self.pr_number}: {self.title}"

class Comment(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)
    author = models.CharField(max_length=255)
    body = models.TextField()
    sentiment = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField()
    # Generic Relation to Issue or Pull Request
    content_type = models.CharField(max_length=50)  # 'issue' or 'pull_request'
    object_id = models.IntegerField()

    def __str__(self):
        return f"Comment by {self.author}"
