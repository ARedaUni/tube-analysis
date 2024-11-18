from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Avg
from .models import Repository, Contributor, Issue, PullRequest, Comment
from .serializers import (
    RepositoryLightSerializer, RepositorySerializer, ContributorSerializer, IssueSerializer,
    PullRequestSerializer, CommentSerializer
)

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.views import APIView
from rest_framework.response import Response

class RepositoryStatsView(APIView):
    def get(self, request, repository_id):
        repo = Repository.objects.get(id=repository_id)
        stats = {
            "avg_issue_close_time": repo.avg_issue_close_time,
            "avg_pr_merge_time": repo.avg_pr_merge_time,
            "positive_comment_percentage": repo.positive_comment_percentage,
            "negative_comment_percentage": repo.negative_comment_percentage,
        }
        return Response(stats)


class RepositoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Repository.objects.select_related().prefetch_related('pull_requests')
    serializer_class = RepositorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name', 'owner', 'created_at']

    @action(detail=False, methods=['get'], url_path='by-name/(?P<name>[^/.]+)')
    def get_by_name(self, request, name=None):
        try:
            # Fetch repository without fetching unnecessary related fields
            repository = Repository.objects.only(
                'id', 'name', 'owner', 'description', 'stars', 'forks', 'open_issues',
                'created_at', 'updated_at', 'avg_issue_close_time', 'avg_pr_merge_time',
                'top_contributors', 'open_issues_count', 'closed_issues_count',
                'merged_pr_count', 'unmerged_pr_count', 'positive_comment_percentage',
                'negative_comment_percentage', 'neutral_comment_percentage'
            ).get(name=name)

            serializer = RepositoryLightSerializer(repository)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Repository.DoesNotExist:
            return Response({'error': 'Repository not found'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=False, methods=['get'], url_path='names-only')
    def names_only(self, request):
        repositories = Repository.objects.only('name').values_list('name', flat=True)
        return Response(repositories, status=status.HTTP_200_OK)

class ActivityTimelineView(APIView):
    def get(self, request, repository_id):
        issues = Issue.objects.filter(repository__id=repository_id).values('title', 'created_at')
        prs = PullRequest.objects.filter(repository__id=repository_id).values('title', 'created_at')
        comments = Comment.objects.filter(repository__id=repository_id).values('body', 'created_at')
        
        timeline = list(issues) + list(prs) + list(comments)
        timeline.sort(key=lambda x: x['created_at'])  # Sort by date
        return Response(timeline)

class RepositoryComparisonView(APIView):
    def get(self, request):
        ids = request.query_params.get('ids')  # Expect a comma-separated list of IDs
        if not ids:
            return Response({'error': 'No repository IDs provided'}, status=400)
        ids = ids.split(',')

        repositories = Repository.objects.filter(id__in=ids)
        data = [
            {
                "name": repo.name,
                "stars": repo.stars,
                "forks": repo.forks,
                "avg_issue_close_time": repo.avg_issue_close_time,
                "avg_pr_merge_time": repo.avg_pr_merge_time,
            }
            for repo in repositories
        ]
        return Response(data)


class ContributorListView(generics.ListAPIView):
    serializer_class = ContributorSerializer

    def get_queryset(self):
        repository_id = self.kwargs['repository_id']
        return Contributor.objects.filter(repositories__id=repository_id)

class IssueListView(generics.ListAPIView):
    serializer_class = IssueSerializer

    def get_queryset(self):
        repository_id = self.kwargs['repository_id']
        return Issue.objects.filter(repository__id=repository_id)

class PullRequestListView(generics.ListAPIView):
    serializer_class = PullRequestSerializer

    def get_queryset(self):
        repository_id = self.kwargs['repository_id']
        return PullRequest.objects.filter(repository__id=repository_id)

class CommentListView(generics.ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        repository_id = self.kwargs['repository_id']
        return Comment.objects.filter(repository__id=repository_id)
