# Generated by Django 5.1.3 on 2024-11-15 08:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Repository',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('owner', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True, null=True)),
                ('stars', models.IntegerField(default=0)),
                ('forks', models.IntegerField(default=0)),
                ('open_issues', models.IntegerField(default=0)),
                ('created_at', models.DateTimeField()),
                ('updated_at', models.DateTimeField()),
            ],
        ),
        migrations.CreateModel(
            name='PullRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pr_number', models.IntegerField()),
                ('title', models.CharField(max_length=255)),
                ('body', models.TextField(blank=True, null=True)),
                ('state', models.CharField(max_length=50)),
                ('merged', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField()),
                ('merged_at', models.DateTimeField(blank=True, null=True)),
                ('repository', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pull_requests', to='github_health.repository')),
            ],
        ),
        migrations.CreateModel(
            name='Issue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('issue_number', models.IntegerField()),
                ('title', models.CharField(max_length=255)),
                ('body', models.TextField(blank=True, null=True)),
                ('state', models.CharField(max_length=50)),
                ('sentiment', models.FloatField(blank=True, null=True)),
                ('created_at', models.DateTimeField()),
                ('closed_at', models.DateTimeField(blank=True, null=True)),
                ('repository', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='issues', to='github_health.repository')),
            ],
        ),
        migrations.CreateModel(
            name='Contributor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(max_length=255, unique=True)),
                ('contributions', models.IntegerField(default=0)),
                ('repositories', models.ManyToManyField(related_name='contributors', to='github_health.repository')),
            ],
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author', models.CharField(max_length=255)),
                ('body', models.TextField()),
                ('sentiment', models.FloatField(blank=True, null=True)),
                ('created_at', models.DateTimeField()),
                ('content_type', models.CharField(max_length=50)),
                ('object_id', models.IntegerField()),
                ('repository', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='github_health.repository')),
            ],
        ),
    ]