# sentiment/tasks.py
import logging
from celery import shared_task
from .models import Tweet, Line, Station
import snscrape.modules.twitter as sntwitter
from datetime import datetime, timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)

@shared_task
def scrape_tweets():
    try:
        logger.info("Starting scrape_tweets task")
        
        # Example scraping logic
        tweets = [
            {"text": "Tweet 1", "line": "Line 1", "station": "Station 1", "sentiment": "positive"},
            {"text": "Tweet 2", "line": "Line 2", "station": "Station 2", "sentiment": "neutral"},
        ]

        for tweet in tweets:
            Tweet.objects.create(
                text=tweet["text"],
                line=tweet["line"],
                station=tweet["station"],
                sentiment=tweet["sentiment"]
            )
        logger.info("Successfully saved tweets")
    except Exception as e:
        logger.error(f"Error in scrape_tweets: {e}")
        raise

def generate_keywords():
    """
    Generate a list of keywords to search for.
    """
    lines = Line.objects.values_list('name', flat=True)
    stations = Station.objects.values_list('name', flat=True)
    keywords = list(lines) + list(stations)
    return keywords

def get_line_from_keyword(keyword):
    """
    Get Line object from keyword.
    """
    try:
        return Line.objects.get(name__iexact=keyword)
    except Line.DoesNotExist:
        return None

def get_station_from_keyword(keyword):
    """
    Get Station object from keyword.
    """
    try:
        return Station.objects.get(name__iexact=keyword)
    except Station.DoesNotExist:
        return None
