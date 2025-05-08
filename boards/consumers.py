import socketio
from asgiref.sync import sync_to_async
from .models import DrawingEvent
from whiteboard.asgi import sio

@sio.event
async def connect(sid, environ, auth):
    print(f"Socket connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Socket disconnected: {sid}")

@sio.event
async def join(sid, data):
    room = data.get('board_id')
    if room:
        await sio.enter_room(sid, room)
        print(f"SID {sid} joined room {room}")

@sio.event
async def leave(sid, data):
    room = data.get('board_id')
    if room:
        await sio.leave_room(sid, room)
        print(f"SID {sid} left room {room}")

@sio.event
async def draw_event(sid, data):
    board_id = data.get('board_id')
    if not board_id:
        return

    # Persist event
    await sync_to_async(DrawingEvent.objects.create)(
        board_id=board_id,
        user_id=data.get('user_id'),
        data=data
    )

    # Broadcast to everyone else in room
    await sio.emit('draw_event', data, room=board_id, skip_sid=sid)
