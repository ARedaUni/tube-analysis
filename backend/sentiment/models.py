from django.db import models


class Line(models.Model):
    name = models.CharField(max_length=100, unique=True)
    average_sentiment = models.FloatField(default=0.0)
    issues_count = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Station(models.Model):
    name = models.CharField(max_length=100)
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='stations')
    average_sentiment = models.FloatField(default=0.0)

    def __str__(self):
        return self.name

class Tweet(models.Model):
    text = models.TextField()
    line = models.ForeignKey(Line, on_delete=models.CASCADE, related_name='tweets', null=True, blank=True)
    station = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='tweets', null=True, blank=True)
    sentiment = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.text[:50]
