from rest_framework import serializers
from .models import Board, DrawingEvent, MindMapNode, StickyNote, MindMap

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = '__all__'

class DrawingEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrawingEvent
        fields = '__all__'

class MindMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = MindMap
        fields = ['id', 'name', 'created_at']

class MindMapNodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MindMapNode
        fields = ['id', 'parent', 'content', 'metadata']

class StickyNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StickyNote
        fields = '__all__'