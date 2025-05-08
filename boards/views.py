from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Board, DrawingEvent, MindMap, MindMapNode, StickyNote
from .serializers import DrawingEventSerializer, BoardSerializer, MindMapNodeSerializer, StickyNoteSerializer, MindMapSerializer
from rest_framework.views import APIView
import uuid
from django.conf import settings
import json
import logging
import re
import requests

logger = logging.getLogger(__name__)

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"


class BoardViewSet(viewsets.ModelViewSet):
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    
    @action(detail=True, methods=['get'])
    def state(self, request, pk=None):
        """Get the current state of the board"""
        board = self.get_object()
        # Get the latest drawing events
        events = DrawingEvent.objects.filter(board=board).order_by('created_at')
        return Response({
            'events': DrawingEventSerializer(events, many=True).data,
        })
    
    @action(detail=True, methods=['post'])
    def autosave(self, request, pk=None):
        """Autosave the board state"""
        board = self.get_object()
        state = request.data.get('state', {})
        # Here you could save the state to a cache or database
        return Response({'status': 'saved'})
    
    @action(detail=True, methods=['get'])
    def mindmap(self, request, pk=None):
        """Get all mindmap nodes for this board"""
        board = self.get_object()
        nodes = MindMapNode.objects.filter(board=board)
        return Response(MindMapNodeSerializer(nodes, many=True).data)

class DrawingEventViewSet(viewsets.ModelViewSet):
    queryset = DrawingEvent.objects.all()
    serializer_class = DrawingEventSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new drawing event"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Broadcast the event via WebSocket (handled in consumers.py)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class MindMapViewSet(viewsets.ModelViewSet):
    """
    On create: calls Groq to generate a JSON array of nodes, 
    sanitizes and falls back on invalid UUIDs, persists them.
    """
    queryset = MindMap.objects.all()
    serializer_class = MindMapSerializer

    def create(self, request, *args, **kwargs):
        # 1) create the MindMap record
        name = (request.data.get("name") or "").strip() or "Untitled Mind Map"
        serializer = self.get_serializer(data={"name": name})
        serializer.is_valid(raise_exception=True)
        mindmap = serializer.save()

        # 2) build payload
        system_msg = {
            "role": "system",
            "content": (
                "You are an expert at generating mind-map structures. "
                "Return ONLY a JSON array of node objects, each with keys: "
                "\"id\" (UUID), \"parent\" (UUID or null), \"content\" (string), \"metadata\" (object)."
            )
        }
        user_msg = {"role": "user", "content": f"Create a mind-map for the topic: “{name}”"}
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [system_msg, user_msg],
            "temperature": 0.0,
            "max_tokens": 32768,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        }

        # 3) call Groq
        try:
            resp = requests.post(GROQ_CHAT_URL, json=payload, headers=headers, timeout=120)
            resp.raise_for_status()
            raw = resp.json()["choices"][0]["message"]["content"]
            logger.error("GROQ RAW RESPONSE >>>\n%s\n<<<", raw)
        except Exception as e:
            mindmap.delete()
            logger.exception("Groq API call failed")
            return Response(
                {"detail": "Groq request failed", "error": str(e)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # 4) parse JSON array (with fallback)
        try:
            nodes_data = json.loads(raw)
            if not isinstance(nodes_data, list):
                raise ValueError("Expected top-level JSON array")
        except Exception:
            m = re.search(r"\[.*\]", raw, flags=re.S)
            if m:
                try:
                    nodes_data = json.loads(m.group(0))
                except Exception as e2:
                    mindmap.delete()
                    logger.exception("Fallback JSON parse failed")
                    return Response(
                        {"detail": "Failed to parse JSON", "error": str(e2), "raw": raw[:200]+"…"},
                        status=status.HTTP_502_BAD_GATEWAY,
                    )
            else:
                mindmap.delete()
                return Response(
                    {"detail": "No JSON array found", "raw": raw[:200]+"…"},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

        # 5) persist nodes, sanitizing UUIDs
        created = []
        for n in nodes_data:
            # sanitize node ID
            raw_id = n.get("id")
            try:
                node_uuid = str(uuid.UUID(raw_id))
            except Exception:
                node_uuid = str(uuid.uuid4())

            # sanitize parent
            parent_obj = None
            pid = n.get("parent")
            if pid:
                try:
                    parent_obj = MindMapNode.objects.get(id=pid)
                except Exception:
                    parent_obj = None

            node = MindMapNode.objects.create(
                id=node_uuid,
                mindmap=mindmap,
                parent=parent_obj,
                content=n.get("content", ""),
                metadata=n.get("metadata", {}),
            )
            created.append(MindMapNodeSerializer(node).data)

        result = MindMapSerializer(mindmap).data
        result["nodes"] = created
        return Response(result, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"])
    def nodes(self, request, pk=None):
        mindmap = self.get_object()
        qs = MindMapNode.objects.filter(mindmap=mindmap)
        return Response(MindMapNodeSerializer(qs, many=True).data)
    
class MindMapNodeViewSet(viewsets.ModelViewSet):
    """
    CRUD for individual mind-map nodes.
    """
    queryset = MindMapNode.objects.all()
    serializer_class = MindMapNodeSerializer
        
class StickyNoteViewSet(viewsets.ModelViewSet):
    queryset = StickyNote.objects.all()
    serializer_class = StickyNoteSerializer

class CreateBoardView(APIView):
    def post(self, request):
        board = Board.objects.create(name=f"Room {uuid.uuid4()}")
        return Response({
            "id": board.id,
            "share_link": board.get_share_link()
        }, status=status.HTTP_201_CREATED)