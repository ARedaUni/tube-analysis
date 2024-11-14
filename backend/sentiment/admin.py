from django.contrib import admin
from .models import Tweet, Station, Line

@admin.register(Tweet)
class TweetAdmin(admin.ModelAdmin):
    list_display = ('text', 'station', 'line', 'sentiment', 'created_at')
    search_fields = ('text', 'station__name', 'line__name')

@admin.register(Station)
class StationAdmin(admin.ModelAdmin):
    list_display = ('name', 'line', 'average_sentiment')
    search_fields = ('name', 'line__name')

@admin.register(Line)
class LineAdmin(admin.ModelAdmin):
    list_display = ('name', 'average_sentiment', 'issues_count')
    search_fields = ('name',)
