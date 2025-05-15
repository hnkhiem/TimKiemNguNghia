# Semantic Search for Student Forms

A full-stack application for semantic search of student forms at HUTECH University.

## Project Structure

```
├── ai_service/               # AI Engineer
│   ├── app.py                # Main FastAPI app
│   ├── import_data.py        # Script to import form data from files
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # How to run the AI service
│
├── backend/                  # Node.js Backend
│   ├── index.js              # Entry point
│   ├── .env                  # Environment variables (port, API URLs)
│   ├── routes/               # Route handlers
│   ├── package.json          # Node project info
│   └── README.md             # How to run the backend
│
├── frontend/                 # React Frontend (with Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   └── styles/
│   ├── tailwind.config.js
│   └── README.md
│
├── docker-compose.yml        # For PostgreSQL and pgvector setup
├── .gitignore
└── README.md                 # Overall project documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v14+)
- Python (v3.8+)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/semantic-search.git
   cd semantic-search
   ```

2. Start the PostgreSQL database with pgvector:
   ```bash
   docker-compose up -d
   ```

3. Set up the AI service:
   ```bash
   cd ai_service
   pip install -r requirements.txt
   # Create .env file as described in ai_service/README.md
   ```

4. Set up the backend:
   ```bash
   cd backend
   npm install
   # Create .env file as described in backend/README.md
   ```

5. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

1. Start the AI service:
   ```bash
   cd ai_service
   python app.py
   ```

2. Start the backend:
   ```bash
   cd backend
   npm start
   ```

3. Start the frontend:
   ```bash
   cd frontend
   npm start
   ```

4. Access the application at http://localhost:3000

## Features

- Semantic search for student forms
- Modern, responsive UI
- Fast and accurate search results
- Support for Vietnamese language

## Technologies Used

- **Frontend**: React, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express
- **AI Service**: FastAPI, PostgreSQL with pgvector
- **Database**: PostgreSQL with pgvector extension
- **Deployment**: Docker, Docker Compose

## License

This project is licensed under the MIT License - see the LICENSE file for details.
