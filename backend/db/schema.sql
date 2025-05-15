CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS forms (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    embedding vector(768) NOT NULL,
    content TEXT
);


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_Number INT,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50),     
    description TEXT,      
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE upload_logs (
  id SERIAL PRIMARY KEY,
  filename TEXT,
  user_id INT REFERENCES users(id),
  status TEXT CHECK (status IN ('upload', 'delete')),
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE download_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  filename TEXT NOT NULL,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_resets (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);




