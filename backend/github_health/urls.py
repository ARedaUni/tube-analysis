from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityTimelineView, RepositoryComparisonView, RepositoryStatsView, RepositoryViewSet, ContributorListView, IssueListView, PullRequestListView, CommentListView
# Router for repository viewset
router = DefaultRouter()
router.register(r'repositories', RepositoryViewSet, basename='repository')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),  # Includes repository viewset endpoints
    path('repositories/<int:repository_id>/contributors/', ContributorListView.as_view(), name='contributors'),
    path('repositories/<int:repository_id>/issues/', IssueListView.as_view(), name='issues'),
    path('repositories/<int:repository_id>/pull-requests/', PullRequestListView.as_view(), name='pull-requests'),
    path('repositories/<int:repository_id>/comments/', CommentListView.as_view(), name='comments'),
    path('repositories/<int:repository_id>/stats/', RepositoryStatsView.as_view(), name='repository-stats'),
    path('repositories/<int:repository_id>/timeline/', ActivityTimelineView.as_view(), name='repository-timeline'),
    path('repositories/compare/', RepositoryComparisonView.as_view(), name='repository-compare'),
    path('repositories/by-name/<str:name>', RepositoryViewSet.as_view({'get': 'get_by_name'}), name='repository-by-name'),
    path('repositories/names-only/', RepositoryViewSet.as_view({'get': 'names_only'}), name='repository-names'),
]
