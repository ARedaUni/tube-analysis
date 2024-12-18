# Generated by Django 5.1.3 on 2024-11-18 17:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('github_health', '0003_alter_comment_sentiment_alter_issue_sentiment'),
    ]

    operations = [
        migrations.AddField(
            model_name='repository',
            name='code_frequency',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='repository',
            name='code_of_conduct',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='repository',
            name='commit_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='repository',
            name='commit_frequency',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='repository',
            name='contributing_guidelines',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='repository',
            name='contributor_growth_rate',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='repository',
            name='dependencies',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='repository',
            name='fork_growth_rate',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='repository',
            name='issue_categories',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='repository',
            name='issue_resolution_rate',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='repository',
            name='issue_template',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='repository',
            name='languages',
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name='repository',
            name='median_issue_response_time',
            field=models.DurationField(null=True),
        ),
        migrations.AddField(
            model_name='repository',
            name='median_pr_response_time',
            field=models.DurationField(null=True),
        ),
        migrations.AddField(
            model_name='repository',
            name='pr_merge_rate',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='repository',
            name='pr_review_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='repository',
            name='pr_template',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='repository',
            name='star_growth_rate',
            field=models.FloatField(default=0),
        ),
    ]
