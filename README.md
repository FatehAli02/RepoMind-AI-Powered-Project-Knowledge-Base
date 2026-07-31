# 🧠 RepoMind: AI-Powered Project Knowledge Base

![RepoMind Architecture](https://img.shields.io/badge/Architecture-Full--Stack_RAG-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%2B_pgvector-336791?logo=postgresql)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

RepoMind is a Full-Stack Retrieval-Augmented Generation (RAG) application that allows developers to upload project documentation (READMEs, API docs, architecture notes) and ask plain-English questions about their codebase. The system retrieves the most relevant context and generates highly accurate, context-aware answers, citing exact sources.

## 🎥 Working Demo


https://github.com/user-attachments/assets/c096a213-a748-438f-ad0a-4c117a6bc01c


## ✨ Core Features

* **🔐 Secure Authentication**: JWT-based authentication flow with password hashing (`pwdlib[argon2]`) to protect user data and API routes.
* **📂 Isolated Project Containers**: Users can create dedicated project workspaces and upload related markdown/text documentation.
* **🧠 Intelligent RAG Pipeline**: 
    * **Ingestion & Chunking**: Automatically parses and slices `.txt`, `.md` and code files into optimized overlapping chunks.
    * **Cloud Embeddings**: Integrates with the **Google Gemini Embeddings API** (`gemini-embedding-001`) via the Google GenAI SDK to generate high-dimensional vectors, optimizing server memory and preventing OOM crashes.
    * **Vector Search**: Utilizes **pgvector** within PostgreSQL to perform lightning-fast Cosine Similarity searches.
    * **Context-Aware Generation**: Injects retrieved context into a strict prompt system and queries the **Groq API (Llama 3.1 8B)** to generate hallucination-free answers.
* **⚡ Modern Frontend**: A responsive, Single Page Application (SPA) built with React, Vite, and Tailwind CSS. Features formatted markdown rendering for code blocks and a real-time chat interface.

## 🛠️ Tech Stack

**Backend (Python)**
* **Framework**: FastAPI
* **ORM & Migrations**: SQLAlchemy 2.0, Alembic
* **AI/ML**: `google-genai` (Embeddings), `groq` (LLM Generation)
* **Auth**: PyJWT, OAuth2

**Frontend (JavaScript)**
* **Framework**: React (Bootstrapped with Vite)
* **Styling**: Tailwind CSS
* **Routing & UI**: React Router DOM, React Markdown

**Database & DevOps**
* **Database**: PostgreSQL with the `pgvector` extension (Hosted on Supabase)
* **Containerization**: Docker & Docker Compose
* **Deployment**: Railway (Backend), Vercel (Frontend)

---

## 📂 Project Architecture

```text
RepoMind/
├── app/                      # FastAPI Backend
│   ├── core/                 # Configuration & Security (pydantic-settings, JWT logic)
│   ├── models/               # SQLAlchemy Declarative Models (User, Project, Document, Chunk)
│   ├── schemas/              # Pydantic Validation Schemas
│   ├── routers/              # API Endpoints (/auth, /projects, /documents, /ask)
│   ├── services/             # Chunking, Embeddings, and LLM Logic
│   ├── database.py           # DB Engine & SessionLocal setup
│   └── main.py               # FastAPI App Initialization & CORS
├── frontend/                 # React SPA
│   ├── public/               # Static assets (Favicons, etc.)
│   ├── src/
│   │   ├── components/       # Reusable UI elements
│   │   ├── pages/            # Main Views (Login, Dashboard, Chat Interface)
│   │   ├── api.js            # Axios/Fetch client with JWT interceptors
│   │   └── App.jsx           # React Router configuration
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tailwind setup
├── alembic/                  # Database Migration Scripts
├── Dockerfile                # Backend Image Blueprint
├── docker-compose.yml        # Local Orchestration (FastAPI + pgvector)
├── requirements.txt          # Python Dependencies
└── .env                      # Environment Variables
```


## 🚀 Getting Started (Local Development)

### 1. Prerequisites

Before running the project, make sure you have the following installed:

- Docker Desktop (installed and running)
- Node.js (v20+)
- API keys for:
  - Google Gemini (Google AI Studio)
  - Groq

---

### 2. Environment Setup

Create a `.env` file in the project root and add the following variables:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/repomind
SECRET_KEY=your_super_secret_jwt_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

---

### 3. Start the Backend

Build and start the PostgreSQL database and FastAPI backend using Docker Compose:

```bash
docker-compose up --build
```

> **Note:** The first build may take several minutes since Docker needs to download the base images and install the Python dependencies.

---

### 4. Run Database Migrations

After the database is running, open a new terminal, activate your virtual environment, and run the Alembic migrations:

```bash
alembic upgrade head
```

This will create all required database tables.

---

### 5. Start the Frontend

Navigate to the frontend directory, install the dependencies, and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

---

### 🌐 Access the Application

- **Frontend:** https://repomind-frontend-eight.vercel.app/
- **Backend API Docs (Swagger):** https://repomind-ai-powered-project-knowledge-base-production.up.railway.app/docs

## 👨‍💻 Author

Made by Fateh Ali

[LinkedIn](www.linkedin.com/in/fateh-ali-072348352) | [GitHub](https://github.com/FatehAli02)

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
