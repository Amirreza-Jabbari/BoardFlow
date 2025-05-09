# Dockerfile
FROM python:3.12.3-slim

ENV PYTHONUNBUFFERED=1 \
    POETRY_VIRTUALENVS_CREATE=false

WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       build-essential \
       libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# Install pip, copy requirements
COPY requirements.txt .
RUN pip install --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Make entrypoint executable
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
