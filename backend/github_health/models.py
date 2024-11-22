
# core/models.py

from django.db import models
from django.db.models import JSONField
from django.utils import timezone
from django.utils.timezone import now

class Repository(models.Model):
    name = models.CharField(max_length=255)
    owner = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    stars = models.IntegerField(default=0)
    forks = models.IntegerField(default=0)
    open_issues = models.IntegerField(default=0)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    # Computed Metrics
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
    commit_frequency = models.FloatField(default=0)  # Total commits in the last 7 days
    code_frequency = JSONField(default=dict)        # Weekly additions/deletions

    # Community Health
    contributing_guidelines = models.BooleanField(default=False)
    code_of_conduct = models.BooleanField(default=False)
    issue_template = models.BooleanField(default=False)
    pr_template = models.BooleanField(default=False)

    # Code Quality
    languages = JSONField(default=dict)  # Language distribution

    # Response Times
    median_issue_response_time = models.DurationField(null=True, blank=True)
    median_pr_response_time = models.DurationField(null=True, blank=True)

    # Issue Analytics
    issue_resolution_rate = models.FloatField(default=0)

    # PR Analytics
    pr_merge_rate = models.FloatField(default=0)

    # Community Growth
    star_growth_rate = models.FloatField(default=0)

    # Relationships
    contributors = models.ManyToManyField('Contributor', through='RepositoryContributor', related_name='repositories')

    def __str__(self):
        return f"{self.owner}/{self.name}"


class Contributor(models.Model):
    username = models.CharField(max_length=255, unique=True)
    total_contributions = models.IntegerField(default=0)  # Total contributions across all repositories

    def __str__(self):
        return self.username


class RepositoryContributor(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)
    contributor = models.ForeignKey(Contributor, on_delete=models.CASCADE)
    contributions = models.IntegerField(default=0)  # Contributions to the specific repository
    created_at = models.DateTimeField(default=now)  
    class Meta:
        unique_together = ('repository', 'contributor')

    def __str__(self):
        return f"{self.contributor.username} in {self.repository.name}"


class Issue(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE, related_name='issues')
    issue_number = models.IntegerField()
    title = models.CharField(max_length=500)
    body = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=100)  # e.g., 'open', 'closed'
    created_at = models.DateTimeField()
    closed_at = models.DateTimeField(null=True, blank=True)
    response_time = models.DurationField(null=True, blank=True)

    class Meta:
        unique_together = ('repository', 'issue_number')

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
    response_time = models.DurationField(null=True, blank=True)

    class Meta:
        unique_together = ('repository', 'pr_number')

    def __str__(self):
        return f"PR #{self.pr_number}: {self.title}"


class Comment(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)
    author = models.CharField(max_length=255)
    body = models.TextField()
    sentiment = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField()
    content_type = models.CharField(max_length=50)  # 'issue' or 'pull_request'
    object_id = models.IntegerField()

    def __str__(self):
        return f"Comment by {self.author} on {self.content_type} #{self.object_id}"
