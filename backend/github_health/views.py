# core/views.py

from rest_framework import viewsets
from .models import Repository, Contributor, Issue, PullRequest, Comment
from .serializers import (
    RepositorySerializer,
    ContributorSerializer,
    IssueSerializer,
    PullRequestSerializer,
    CommentSerializer,
)

class RepositoryViewSet(viewsets.ModelViewSet):
    queryset = Repository.objects.all()
    serializer_class = RepositorySerializer

class ContributorViewSet(viewsets.ModelViewSet):
    queryset = Contributor.objects.all()
    serializer_class = ContributorSerializer

class IssueViewSet(viewsets.ModelViewSet):
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

class PullRequestViewSet(viewsets.ModelViewSet):
    queryset = PullRequest.objects.all()
    serializer_class = PullRequestSerializer

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
