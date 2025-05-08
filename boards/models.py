import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Board(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def get_share_link(self):
        return f"/boards/{self.id}/"

class DrawingEvent(models.Model):
    board = models.ForeignKey(Board, related_name='events', on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

class StickyNote(models.Model):
    board = models.ForeignKey(Board, related_name='notes', on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    content = models.TextField()
    color = models.CharField(max_length=7, default='#fff9a')
    position = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def update_content(self, new_content):
        self.content = new_content
        self.save()
    def update_style(self, color=None, position=None):
        if color: self.color = color
        if position: self.position = position
        self.save()

class MindMap(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class MindMapNode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mindmap = models.ForeignKey(MindMap, related_name='nodes', on_delete=models.CASCADE)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', on_delete=models.CASCADE)
    content = models.CharField(max_length=255)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)