from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BoardViewSet,
    DrawingEventViewSet,
    StickyNoteViewSet,
    MindMapViewSet,
    CreateBoardView,
    MindMapNodeViewSet,
)

router = DefaultRouter()
router.register(r'boards', BoardViewSet)
router.register(r'drawings', DrawingEventViewSet)
router.register(r'notes', StickyNoteViewSet)
router.register(r'mindmaps', MindMapViewSet, basename='mindmap')
router.register(r'mindnodes', MindMapNodeViewSet, basename='mindnode')

urlpatterns = [
    # Custom create board must come first
    path('boards/create/', CreateBoardView.as_view(), name='create-board'),

    # Then the standard viewset routes
    path('', include(router.urls)),
]
