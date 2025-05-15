const pool = require('../db');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const mammoth = require('mammoth');
const pdf = require('pdf-parse');
const { exec } = require('child_process');

const MAX_TEXT_LENGTH = 20000;
const EMBEDDING_API = process.env.EMBEDDING_API;

// ⚙️ Chuyển file .docx sang .pdf bằng LibreOffice
const convertDocxToPdf = (inputPath, outputDir) => {
  return new Promise((resolve, reject) => {
    const command = `libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) return reject(stderr);
      resolve(stdout);
    });
  });
};

// 📥 Trích xuất nội dung từ file
const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.promises.readFile(filePath);

  try {
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (ext === '.pdf') {
      const result = await pdf(buffer);
      return result.text;
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (err) {
    throw new Error(`Error extracting file content: ${err.message}`);
  }
};

// 🚀 Upload handler
const uploadForm = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const insertedForms = [];

    for (const file of files) {
      const originalName = file.originalname; // giữ nguyên tên gốc
      const ext = path.extname(originalName).toLowerCase();
      const uploadPath = file.path;
      const uploadDir = path.dirname(uploadPath);
      let savedFileName = path.basename(uploadPath);

      let content;
      try {
        content = await extractTextFromFile(uploadPath);
        if (!content || content.trim() === "") {
          fs.unlinkSync(uploadPath);
          return res.status(400).json({ error: 'Không thể trích xuất nội dung từ file.' });
        }
      } catch (err) {
        fs.unlinkSync(uploadPath);
        return res.status(400).json({ error: err.message });
      }

      const truncated = content.slice(0, MAX_TEXT_LENGTH);

      // Gọi embedding API
      let embed;
      try {
        embed = await axios.post(
          EMBEDDING_API,
          truncated,
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (e) {
        fs.unlinkSync(uploadPath);
        return res.status(500).json({ error: 'Failed to connect to embedding API', details: e.message });
      }

      if (!embed.data || !Array.isArray(embed.data.embedding)) {
        fs.unlinkSync(uploadPath);
        return res.status(500).json({ error: 'Invalid embedding response' });
      }

      const vector = JSON.stringify(embed.data.embedding);

         //Đổi tên đuôi .dox thành .pdf
      const title = ext === '.docx'
      ? originalName.replace(/\.docx$/i, '.pdf')
      : originalName;

      if (ext === '.docx') {
        try {
          await convertDocxToPdf(uploadPath, uploadDir);
          const pdfFileName = savedFileName.replace('.docx', '.pdf');
          const convertedPdfPath = path.join(uploadDir, pdfFileName);
        
          if (fs.existsSync(convertedPdfPath)) {
            savedFileName = pdfFileName;
            fs.unlinkSync(uploadPath); // xoá .docx gốc
          } else {
            fs.unlinkSync(uploadPath);
            return res.status(500).json({ error: 'Không thể chuyển đổi DOCX sang PDF' });
          }
        } catch (convertErr) {
          if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath); // xoá .docx nếu lỗi
          return res.status(500).json({
            error: 'Lỗi khi chuyển đổi file DOCX',
            details: convertErr.message
          });
        }
      }
   
    
      const result = await pool.query(
        'INSERT INTO forms (title, file_path, content, embedding) VALUES ($1, $2, $3, $4::vector) RETURNING *',
        [title, savedFileName, truncated, vector]
      );

      insertedForms.push(result.rows[0]);
    }

    res.status(201).json({ message: 'Uploaded', forms: insertedForms });

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};

module.exports = { uploadForm };
