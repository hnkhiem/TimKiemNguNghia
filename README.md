# 🎯 HUTECH Semantic Search Platform

**Semantic Search Platform for Student Forms** — Hệ thống tìm kiếm ngữ nghĩa sử dụng AI (SBERT), Node.js backend, PostgreSQL (pgvector) và giao diện React.js + TailwindCSS.

## 🚀 Công nghệ sử dụng
- Backend: Node.js + Express
- AI Service: FastAPI + Sentence-BERT (SBERT)
- Database: PostgreSQL + pgvector
- Frontend: React.js + Tailwind CSS
- Docker: cho toàn bộ dịch vụ (backend, frontend, AI, database)

## 🗂️ Cấu trúc thư mục

semantic_search_project/
├── ai_service/ # FastAPI + SBERT AI Service
├── backend/ # Node.js + Express API
├── frontend/ # React + Tailwind UI
├── docker-compose.yml
└── README.md


## ⚙️ Yêu cầu hệ thống

- Docker & Docker Compose >= v20
- Node.js >= v18 (nếu chạy tay)
- PostgreSQL >= 14 (nếu không dùng Docker)

## 📝 Hướng dẫn khởi chạy

### 🏗️ 1. Chạy bằng Docker (khuyên dùng)

```bash
git clone https://github.com/<tên nhóm hoặc cá nhân>/semantic_search_project.git
cd semantic_search_project

# One command khởi động toàn bộ hệ thống
docker-compose up --build


Truy cập:

Frontend: http://localhost:3000

Backend API: http://localhost:5000/api

AI Service: http://localhost:8000


Database:

docker run --name semantic_search_db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres