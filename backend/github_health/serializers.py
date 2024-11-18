from rest_framework import serializers
from .models import Repository, Contributor, Issue, PullRequest, Comment

class ContributorSerializer(serializers.ModelSerializer):
    repositories = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Contributor
        fields = ['id', 'username', 'contributions', 'repositories']

class IssueSerializer(serializers.ModelSerializer):
    repository = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'repository', 'issue_number', 'title', 'body', 
            'state', 'sentiment', 'created_at', 'closed_at', 'response_time'
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
    contributors = ContributorSerializer(many=True, read_only=True)
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
            'neutral_comment_percentage', 'contributors', 'issues', 'pull_requests'
        ]
        
class RepositoryLightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = '__all__'  # Include all fields

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # Dynamically exclude contributors and issues
        data.pop('contributors', None)
        data.pop('issues', None)
        return data

