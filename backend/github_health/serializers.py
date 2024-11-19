# serializers.py

from rest_framework import serializers
from .models import (
    Repository,
    Contributor,
    RepositoryContributor,
    Issue,
    PullRequest,
    Comment
)

class RepositoryContributorSerializer(serializers.ModelSerializer):
    contributor = serializers.StringRelatedField(read_only=True)
    contributions = serializers.IntegerField()

    class Meta:
        model = RepositoryContributor
        fields = ['contributor', 'contributions']

class ContributorSerializer(serializers.ModelSerializer):
    repositories = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Contributor
        fields = ['id', 'username', 'total_contributions', 'repositories']

class IssueSerializer(serializers.ModelSerializer):
    repository = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'repository', 'issue_number', 'title', 'body',
            'state', 'created_at', 'closed_at', 'response_time'
        ]

class PullRequestSerializer(serializers.ModelSerializer):
    repository = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = PullRequest
        fields = [
            'id', 'repository', 'pr_number', 'title', 'body',
            'state', 'merged', 'created_at', 'merged_at', 'response_time'
        ]

class CommentSerializer(serializers.ModelSerializer):
    repository = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'repository', 'author', 'body', 'sentiment',
            'created_at', 'content_type', 'object_id'
        ]

class RepositorySerializer(serializers.ModelSerializer):
    contributors = RepositoryContributorSerializer(
        source='repositorycontributor_set',
        many=True,
        read_only=True
    )
    issues = IssueSerializer(many=True, read_only=True)
    pull_requests = PullRequestSerializer(many=True, read_only=True)

    class Meta:
        model = Repository
        fields = [
            'id', 'name', 'owner', 'description', 'stars', 'forks',
            'open_issues', 'created_at', 'updated_at', 'avg_issue_close_time',
            'avg_pr_merge_time', 'top_contributors', 'open_issues_count',
            'closed_issues_count', 'merged_pr_count', 'unmerged_pr_count',
            'positive_comment_percentage', 'negative_comment_percentage',
            'neutral_comment_percentage', 'commit_count', 'commit_frequency',
            'code_frequency', 'contributing_guidelines', 'code_of_conduct',
            'issue_template', 'pr_template', 'languages', 'median_issue_response_time',
            'median_pr_response_time', 'issue_resolution_rate', 'pr_merge_rate',
            'star_growth_rate', 'contributors', 'issues', 'pull_requests'
        ]

class RepositoryLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = '__all__'  # Include all fields in the model

    def to_representation(self, instance):
        """
        Customize the representation of the repository.
        Dynamically exclude 'issues' and 'pull_requests' from the serialized data.
        """
        data = super().to_representation(instance)
        # Exclude fields that are reverse relationships
        data.pop('issues', None)
        data.pop('pull_requests', None)
        return data

