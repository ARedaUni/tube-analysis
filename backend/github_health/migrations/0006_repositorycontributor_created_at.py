# Generated by Django 5.1.3 on 2024-11-19 15:32

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('github_health', '0005_rename_contributions_contributor_total_contributions_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='repositorycontributor',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
