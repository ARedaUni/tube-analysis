from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FetchRepositoryView,
    RepositoryHealthAndQualityView,
    RepositoryViewSet,
    RepositoryStatsView,
    ContributorListView,
    IssueListView,
    PullRequestListView,
    CommentListView,
    RepositoryMetricsView,
    ActivityTimelineView,
    RepositoryComparisonView,
    TaskStatusView,
)

# Create a router for the RepositoryViewSet
router = DefaultRouter()
router.register(r'repositories', RepositoryViewSet, basename='repository')

urlpatterns = [
    # Include the routes handled by the router
    path('', include(router.urls)),

    #fetching repository endpoints
    path('fetch-repository/', FetchRepositoryView.as_view(), name='fetch-repository'),
    path('task-status/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),

    # Additional endpoints
    path('repositories/<int:repository_id>/contributors/', ContributorListView.as_view(), name='contributors'),
    path('repositories/<int:repository_id>/issues/', IssueListView.as_view(), name='issues'),
    path('repositories/<int:repository_id>/pull-requests/', PullRequestListView.as_view(), name='pull-requests'),
    path('repositories/<int:repository_id>/comments/', CommentListView.as_view(), name='comments'),
    path('repositories/<int:repository_id>/metrics/', RepositoryMetricsView.as_view(), name='repository-metrics'),
    path('repositories/<int:repository_id>/timeline/', ActivityTimelineView.as_view(), name='repository-timeline'),
    path('repositories/compare/', RepositoryComparisonView.as_view(), name='repository-compare'),
       path('repositories/<int:repository_id>/health-and-quality/', RepositoryHealthAndQualityView.as_view(), name='repository-health-quality'),
]
