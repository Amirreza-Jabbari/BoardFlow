# Generated by Django 5.1.1 on 2025-05-07 22:17

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("boards", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="MindMap",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.RemoveField(
            model_name="mindmapnode",
            name="board",
        ),
        migrations.AddField(
            model_name="mindmapnode",
            name="mindmap",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="nodes",
                to="boards.mindmap",
            ),
            preserve_default=False,
        ),
    ]
