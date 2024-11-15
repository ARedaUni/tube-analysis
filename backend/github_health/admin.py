from django.contrib import admin
from .models import Repository, Contributor, Issue, PullRequest, Comment

# Register your models here
admin.site.register(Repository)
admin.site.register(Contributor)
admin.site.register(Issue)
admin.site.register(PullRequest)
admin.site.register(Comment)
