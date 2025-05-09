#!/usr/bin/env sh
# docker-entrypoint.sh

# Exit on error
set -e

# Wait for Postgres (simple loop)
until nc -z db 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done

# Apply migrations
echo "Running migrations…"
python manage.py migrate --noinput

# Collect static if you have any
# python manage.py collectstatic --noinput

# Finally start ASGI server
exec uvicorn whiteboard.asgi:application \
  --host 0.0.0.0 --port 8000
