from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Avg, Count, F
from django.utils import timezone
from datetime import timedelta
from .models import Repository, Contributor, Issue, PullRequest, Comment, RepositoryContributor
from .serializers import (
    RepositoryLightSerializer, RepositorySerializer, ContributorSerializer, IssueSerializer,
    PullRequestSerializer, CommentSerializer
)

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import now


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

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        repository = self.get_object()
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        timeline_data = {
            'dates': [],
            'issues_opened': [],
            'issues_closed': [],
            'prs_opened': [],
            'prs_merged': []
        }
        
        current_date = start_date
        while current_date <= end_date:
            timeline_data['dates'].append(current_date.date())
            
            # Count issues and PRs for each day
            timeline_data['issues_opened'].append(
                Issue.objects.filter(
                    repository=repository,
                    created_at__date=current_date.date()
                ).count()
            )
            # ... similar for other metrics
            
            current_date += timedelta(days=1)
            
        return Response(timeline_data)

    @action(detail=True, methods=['get'])
    def quality_metrics(self, request, pk=None):
        repository = self.get_object()
        
        # Calculate various quality metrics
        metrics = {
            'code_review_coverage': self._calculate_review_coverage(repository),
            'test_coverage': repository.test_coverage,
            'documentation_score': self._calculate_documentation_score(repository),
            'issue_resolution_rate': self._calculate_resolution_rate(repository),
            'pr_success_rate': self._calculate_pr_success_rate(repository),
            'code_style_score': repository.code_style_score
        }
        
        return Response(metrics)

    @action(detail=True, methods=['get'])
    def label_stats(self, request, pk=None):
        repository = self.get_object()
        
        # Get label distribution for issues and PRs
        issue_labels = Issue.objects.filter(repository=repository)\
            .values('labels')\
            .annotate(count=Count('id'))
            
        pr_labels = PullRequest.objects.filter(repository=repository)\
            .values('labels')\
            .annotate(count=Count('id'))
            
        return Response({
            'issue_labels': issue_labels,
            'pr_labels': pr_labels
        })

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

class RepositoryHealthAndQualityView(APIView):
    def get(self, request, repository_id):
        try:
            repo = Repository.objects.get(id=repository_id)

            # Community Health
            community_health = {
                "contributing_guidelines": repo.contributing_guidelines,
                "code_of_conduct": repo.code_of_conduct,
                "issue_template": repo.issue_template,
                "pr_template": repo.pr_template,
            }

            # Activity Timeline
            end_date = now()
            start_date = end_date - timedelta(days=30)
            timeline_data = {
                "dates": [],
                "issues_opened": [],
                "issues_closed": [],
                "prs_opened": [],
                "prs_merged": [],
            }

            current_date = start_date
            while current_date <= end_date:
                timeline_data["dates"].append(current_date.date())
                timeline_data["issues_opened"].append(
                    Issue.objects.filter(
                        repository=repo, created_at__date=current_date.date()
                    ).count()
                )
                timeline_data["issues_closed"].append(
                    Issue.objects.filter(
                        repository=repo, closed_at__date=current_date.date()
                    ).count()
                )
                timeline_data["prs_opened"].append(
                    PullRequest.objects.filter(
                        repository=repo, created_at__date=current_date.date()
                    ).count()
                )
                timeline_data["prs_merged"].append(
                    PullRequest.objects.filter(
                        repository=repo, merged=True, merged_at__date=current_date.date()
                    ).count()
                )
                current_date += timedelta(days=1)

            # Issue and PR Analytics
            issue_data = {
                "open_issues": Issue.objects.filter(repository=repo, state="open").count(),
                "closed_issues": Issue.objects.filter(repository=repo, state="closed").count(),
                "avg_close_time": repo.avg_issue_close_time.total_seconds()
                if repo.avg_issue_close_time
                else 0,
            }
            pr_data = {
                "merge_rate": repo.pr_merge_rate,
                "avg_merge_time": repo.avg_pr_merge_time.total_seconds()
                if repo.avg_pr_merge_time
                else 0,
                "open_prs": PullRequest.objects.filter(repository=repo, state="open").count(),
                "merged_prs": PullRequest.objects.filter(repository=repo, merged=True).count(),
                "closed_prs": PullRequest.objects.filter(repository=repo, state="closed", merged=False).count(),
            }

            # Growth Metrics
            growth_metrics = {
                "star_growth_rate": repo.star_growth_rate,
                # "fork_growth_rate": repo.fork_growth_rate,
                # "contributor_growth_rate": repo.contributor_growth_rate,
            }

            # Contributor Insights
            top_contributors = RepositoryContributor.objects.filter(
                repository=repo
            ).order_by("-contributions")[:5]
            contributors = [
                {"name": contrib.contributor.username, "contributions": contrib.contributions}
                for contrib in top_contributors
            ]

            return Response({
                "community_health": community_health,
                "timeline_data": timeline_data,
                "issue_data": issue_data,
                "pr_data": pr_data,
                "growth_metrics": growth_metrics,
                "contributors": contributors,
            })
        except Repository.DoesNotExist:
            return Response({"error": "Repository not found."}, status=404)



class RepositoryMetricsView(APIView):
    def get(self, request, repository_id):
        repo = Repository.objects.get(id=repository_id)
        activity = {
                    'dates': [],  # Populate with dates
                    'commit_counts': [],  # Populate with commit counts
                    'issues_opened': [],  # Populate with issues opened
                    # Add more as needed
                }
        # Fork Growth Rate (Dynamic)
        fork_growth_rate = (repo.forks / ((now() - repo.created_at).days or 1)) * 30

        # Contributor Growth Rate (Dynamic)
        last_month_contributors = RepositoryContributor.objects.filter(
            repository=repo,
            created_at__gte=now() - timedelta(days=30)
        ).count()
        total_contributors = repo.contributors.count()
        contributor_growth_rate = (last_month_contributors / (total_contributors or 1)) * 100

        # Dependencies (Dynamic Placeholder or Pre-calculated)
        dependencies = {
            'status': 'Not Available',
            'details': 'Dependencies need to be extracted during data processing.'
        }

        # Review Metrics
        total_reviewed_prs = PullRequest.objects.filter(
            repository=repo,
            state='closed',
            response_time__isnull=False  # Only consider PRs with reviews
        ).count()

        approved_prs = PullRequest.objects.filter(
            repository=repo,
            state='closed',
            merged=True
        ).count()

        change_requested_prs = PullRequest.objects.filter(
            repository=repo,
            state='closed',
            merged=False
        ).count()

        approval_rate = (approved_prs / total_reviewed_prs) * 100 if total_reviewed_prs else 0
        change_request_rate = (change_requested_prs / total_reviewed_prs) * 100 if total_reviewed_prs else 0

        avg_review_time = PullRequest.objects.filter(repository=repo).aggregate(
            Avg('response_time')
        )['response_time__avg'] or timedelta(0)

        active_reviewers_count = Contributor.objects.filter(
            repositorycontributor__repository=repo,
            repositorycontributor__created_at__gte=now() - timedelta(days=30)
        ).distinct().count()

        # Existing metrics
        metrics = {
            'activity': {
                'commit_frequency': repo.commit_frequency,
                'code_frequency': repo.code_frequency,
                'commit_count': repo.commit_count
            },
            'community_health': {
                'contributing_guidelines': repo.contributing_guidelines,
                'code_of_conduct': repo.code_of_conduct,
                'issue_template': repo.issue_template,
                'pr_template': repo.pr_template
            },
            'code_quality': {
                'languages': repo.languages,
                'dependencies': dependencies  # Dynamically calculated
            },
            'performance': {
                'issue_resolution_rate': repo.issue_resolution_rate,
                'pr_merge_rate': repo.pr_merge_rate,
                'median_issue_response_time': repo.median_issue_response_time,
                'median_pr_response_time': repo.median_pr_response_time,
            },
            'growth': {
                'star_growth_rate': repo.star_growth_rate,
                'fork_growth_rate': fork_growth_rate,  # Dynamically calculated
                'contributor_growth_rate': contributor_growth_rate,  # Dynamically calculated
            },
            'reviews': {
                'approval_rate': f"{approval_rate:.2f}%",
                'change_request_rate': f"{change_request_rate:.2f}%",
                'avg_review_time': avg_review_time,
                'active_reviewers_count': active_reviewers_count
            }
        }

        return Response(metrics)
