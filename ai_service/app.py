import os
import logging
import unicodedata  # 🔧 MỚI: hỗ trợ chuẩn hóa tiếng Việt không dấu
from fastapi import FastAPI, Body, Query
from fastapi.responses import JSONResponse
from sentence_transformers import SentenceTransformer
import psycopg2
from PyPDF2 import PdfReader
import docx 
from typing import Union, List
import numpy as np
import re

# Tạo thư mục logs nếu chưa có
if not os.path.exists("logs"):
    os.makedirs("logs")

# Thiết lập ghi log
logging.basicConfig(
    filename="logs/upload.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app = FastAPI()
model = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")  # 768 chiều 

# Kết nối PostgreSQL
conn = psycopg2.connect(
    host="semantic_search_db",  
    port=5432,
    user="admin",
    password="123456",
    database="StudentFormDB"
)
cursor = conn.cursor()

# Helper function để đọc file PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PdfReader(file)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
    return text

# Helper function để đọc file DOCX
def extract_text_from_docx(docx_path):
    doc = docx.Document(docx_path)
    return "\n".join([para.text for para in doc.paragraphs])

# 🔧 MỚI: Chuẩn hóa tiếng Việt (bỏ dấu, lowercase)
def normalize_text(text):
    """
    ✅ Chuẩn hóa tiếng Việt: bỏ dấu, chuyển về lowercase
    """
    text = unicodedata.normalize('NFD', text)
    text = ''.join([c for c in text if unicodedata.category(c) != 'Mn'])
    return text.lower()

# 🔧 MỚI: Mapping từ viết tắt hoặc tiếng Anh phổ biến
SYNONYM_MAP = {
    "hocbong": "học bổng",
    "hoclai": "học lại",
    "nghihoc": "nghỉ học",
    "report": "tường trình",
    "dt": "điện thoại",
    "sv": "sinh viên",
    "gv": "giảng viên",
    "cancel": "hủy",
    "apply": "xin",
    "form": "biểu mẫu",
}

def normalize_and_expand(text):
    """
    ✅ Chuẩn hóa + xử lý viết liền + dịch viết tắt/tiếng Anh
    """
    text = normalize_text(text.replace(" ", ""))
    return SYNONYM_MAP.get(text, text)

# Hàm kiểm tra xem tên file đã tồn tại trong cơ sở dữ liệu chưa
def is_file_exists(title):  
    cursor.execute("SELECT COUNT(*) FROM forms WHERE title = %s", (title,))
    count = cursor.fetchone()[0]
    return count > 0

# Hàm xóa tất cả các bản ghi trùng tên file
def delete_duplicate_files():
    try:
        cursor.execute("""
            DELETE FROM forms
            WHERE ctid NOT IN (
                SELECT min(ctid)
                FROM documents
                GROUP BY title
            );
        """)
        conn.commit()
        logging.info("Đã xóa tất cả các bản ghi trùng tên file.")
    except Exception as e:
        logging.error(f"Lỗi khi xóa file trùng: {e}")
        conn.rollback()

# Hàm upload file (dùng chung cho API và auto load)
def upload_file_to_db(file_path):
    title = os.path.basename(file_path)
    
    if is_file_exists(title):
        logging.info(f"File '{title}' đã tồn tại. Xóa file trùng...")
        delete_duplicate_files()
    
    content = ""
    if file_path.endswith(".pdf"):
        content = extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        content = extract_text_from_docx(file_path)
    else:
        logging.warning(f"Bỏ qua file không hỗ trợ: {file_path}")
        return {"error": "Unsupported file type"}
    
    embedding = model.encode(content).tolist()
    
    try:
        cursor.execute(
            "INSERT INTO forms (title, content, embedding) VALUES (%s, %s, %s)",
            (title, content, embedding)
        )
        conn.commit()
        logging.info(f"Uploaded: {title}")
        return {"status": "uploaded", "title": title}
    except Exception as e:
        logging.error(f"Lỗi khi upload file: {e}")
        conn.rollback()
        return {"error": f"Failed to upload file: {e}"}

#API/Search
@app.get("/search")
def semantic_search(
    query: str = Query(..., description="Câu truy vấn tìm kiếm"),
    top_k: int = Query(5, description="Số lượng kết quả tối đa muốn trả về")
):
    """
    ✅ API Semantic Search nâng cao:

    🎯 Tính năng chính (CẬP NHẬT):
    1. Ưu tiên so khớp với tiêu đề biểu mẫu người dùng nhớ
    2. Nội dung biểu mẫu được so khớp kỹ hơn với câu mô tả
    3. Tên file chỉ được ưu tiên nếu người dùng nhập gần giống tên file
    4. SBERT được dùng để hiểu ý đại diện (ngữ cảnh đầy đủ)
    5. Kết hợp tất cả tiêu chí để tính điểm và lọc thông minh
    """
    logging.info(f"🔍 Semantic search: {query}")

    try:
        query_vec = model.encode(query).tolist()
        query_clean = normalize_text(query)
        query_expanded = normalize_and_expand(query_clean)

        # 🔧 TRUY VẤN THÊM filename để xử lý đúng
        cursor.execute("SELECT title, content, embedding, title FROM forms")
        rows = cursor.fetchall()

        def cosine_similarity(a, b):
            a = np.array(a, dtype=np.float32)
            b = np.array(eval(b), dtype=np.float32) if isinstance(b, str) else np.array(b, dtype=np.float32)
            norm = (np.linalg.norm(a) * np.linalg.norm(b))
            return float(np.dot(a, b) / norm) if norm != 0 else 0.0

        results = []
        COSINE_THRESHOLD = 0.6

        for title, content, embedding, filename in rows:
            title_clean = normalize_text(title)
            content_clean = normalize_text(content)
            file_clean = normalize_text(filename or "")
            full_text = f"{title_clean} {content_clean}"

            score = 0.0
            reason = ""

            # ✅ Ưu tiên nếu truy vấn gần giống tên file thực sự (chứa ".doc" hoặc rõ định dạng)
            if "." in query_clean or query_clean.endswith("docx") or query_clean == file_clean:
                if query_clean in file_clean:
                    score = 1.0
                    reason = "Khớp gần đúng tên file"
            # ✅ Ưu tiên tiêu đề
            elif query_expanded in title_clean:
                score = 0.98
                reason = "Khớp gần đúng tiêu đề"
            # ✅ Ưu tiên nội dung (sâu)
            elif query_expanded in content_clean:
                score = 0.9
                reason = "Khớp toàn văn không dấu"
            elif any(word in content_clean for word in query_expanded.split()):
                score = 0.8
                reason = "Một số từ trùng trong nội dung"
            else:
                score = cosine_similarity(query_vec, embedding)
                reason = "Hiểu ý đại diện (SBERT)"

            if score >= COSINE_THRESHOLD:
                # 🔍 Tạo đoạn trích liên quan từ nội dung
                sentences = re.split(r'[.?!]\s+', content)
                matched = [s for s in sentences if query_expanded in normalize_text(s)]
                snippet = " ".join(matched)[:300] + "..." if matched else content[:300] + "..."

                results.append({
                    "title": title,
                    "snippet": snippet,
                    "similarity_score": round(score, 4),
                    "reason": reason
                })

        sorted_results = sorted(results, key=lambda x: x["similarity_score"], reverse=True)[:top_k]

        return {
            "query": query,
            "top_matches": sorted_results
        }

    except Exception as e:
        logging.error(f"❌ Search error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Search failed", "detail": str(e)}
        )


@app.post("/top-k")
def top_k_search(query: str = Body(...), k: int = Body(...)):
    logging.info(f"🔍 Đang tìm kiếm với truy vấn: {query}, Top {k} kết quả")
    try:
        query_embedding = model.encode(query).tolist()
        cursor.execute("""
            SELECT title, content
            FROM forms
            ORDER BY embedding <=> %s::vector
            LIMIT %s;
        """, (query_embedding, k))
        results = cursor.fetchall()
        if results:
            return {
                "query": query,
                "top_k_results": [
                    {"title": result[0], "content": result[1][:500] + "..."} for result in results
                ]
            }
        else:
            return {
                "query": query,
                "message": f"Không tìm thấy {k} biểu mẫu phù hợp."
            }
    except Exception as e:
        logging.error(f"Lỗi trong quá trình tìm kiếm: {e}")
        cursor.execute("ROLLBACK;")
        return {"error": f"Top-K search failed: {e}"}

@app.post("/get-embedding")
def get_embedding(text: Union[str, List[str]] = Body(...)):
    try:
        if isinstance(text, str):
            text = [text]
        text = [t[:5000] for t in text]
        embeddings = model.encode(text).tolist()
        return {
            "embedding": embeddings[0] if len(embeddings) == 1 else embeddings
        }
    except Exception as e:
        logging.error(f"Lỗi khi sinh embedding: {e}")
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"Lỗi khi sinh embedding: {e}"}
        )
