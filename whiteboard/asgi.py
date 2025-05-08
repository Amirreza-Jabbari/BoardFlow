import os
import django
from django.core.asgi import get_asgi_application
import socketio

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'whiteboard.settings')
django.setup()

# Create a Socket.IO ASGI app
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
django_asgi_app = get_asgi_application()

# Import consumers to register events
import boards.consumers

# Wrap Django ASGI app with Socket.IO's ASGI app
application = socketio.ASGIApp(sio, django_asgi_app)