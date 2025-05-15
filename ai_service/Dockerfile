FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y build-essential && apt-get clean

COPY requirements.txt .

# Không kiểm tra hash để tránh lỗi khi build trong Docker
RUN pip install --no-cache-dir --upgrade --use-deprecated=legacy-resolver -r requirements.txt


COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
