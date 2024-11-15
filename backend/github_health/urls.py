# core/urls.py

from django.urls import path, include
from rest_framework import routers
from .views import (
    RepositoryViewSet,
    ContributorViewSet,
    IssueViewSet,
    PullRequestViewSet,
    CommentViewSet,
)

router = routers.DefaultRouter()
router.register(r'repositories', RepositoryViewSet)
router.register(r'contributors', ContributorViewSet)
router.register(r'issues', IssueViewSet)
router.register(r'pull-requests', PullRequestViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
