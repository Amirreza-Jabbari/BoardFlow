# BoardFlow

A collaborative, real-time whiteboard and AI-powered mind-mapping tool built with Django, Django REST Framework, Socket.IO, and React. It lets users draw, erase, undo/redo strokes, add sticky notes, and generate editable mind maps via Groq AI, all shared live across multiple participants.

---

## Table of Contents

* [Features](#features)
* [Requirements](#requirements)
* [Installation and Setup](#installation-and-setup)
* [Running the Application](#running-the-application)
  * [With Docker Compose](#with-docker-compose)
  * [Running Locally Without Docker](#running-locally-without-docker)
* [Contributing](#contributing)
* [License](#license)

---

## Features

* **Real-time Collaborative Whiteboard**

  * Draw with pen, highlighter, eraser
  * Change color, stroke thickness, undo/redo
  * Shape tools: rectangle, circle, arrow
  * Live syncing via WebSockets (Socket.IO + Django ASGI)

* **Interactive Mind Map Generator**

  * One-click Groq-powered AI mind-map creation
  * Edit node text, drag & drop layout
  * Tree-view editor for nested nodes

* **Sticky Notes & Annotations**

  * Add, update and delete sticky notes
  * Persist positions & styles

* **Board Management**

  * Create, rename, delete multiple boards
  * Shareable room URLs

* **Full-stack Vite + Django**

  * React & Tailwind UI
  * DRF API & Uvicorn ASGI
  * PostgreSQL persistence

---

## Requirements

* Docker & Docker Compose (for containerized development)
* **Or**:

  * Python 3.10+
  * Node.js 18+ / npm 8+
  * PostgreSQL 12+
* A valid `GROQ_API_KEY` (for AI mind-map generation)

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Amirreza-Jabbari/BoardFlow.git
cd BoardFlow
```

### 2. Copy & edit environment

```bash
cp .env.example .env
# then open `.env` and fill in:
#  - POSTGRES_PASSWORD (optional)
#  - GROQ_API_KEY
```

---

## Running the Application

### With Docker Compose

> Builds and launches Postgres, Django API, and React frontend together.

```bash
docker-compose up --build
```

* Django backend ➞ [http://localhost:8000](http://localhost:8000)
* React frontend ➞ [http://localhost:3000](http://localhost:3000)

To tear everything down:

```bash
docker-compose down
```

### Running Locally Without Docker

1. **Backend (Django)**

   ```bash
   # create venv & install
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # set your .env or export vars
   export DATABASE_URL=postgres://postgres:${POSTGRES_PASSWORD}@localhost:5432/whiteboarddb
   export GROQ_API_KEY=your_groq_key
   export SECRET_KEY=your_django_secret

   # run migrations & start server
   python manage.py migrate
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Frontend (React + Vite)**

   ```bash
   cd whiteboard-frontend
   npm install
   # ensure VITE_BACKEND_URL=http://localhost:8000 in your shell or .env
   npm run dev
   ```

---

## Contributing

Contributions are welcome! To propose changes:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Commit and push
4. Open a Pull Request

Please include tests where appropriate and update documentation.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
