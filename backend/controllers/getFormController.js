const pool = require('../db');      //Kết nối POSTGRESQL qua pool
const path = require('path');       //Đường dẫn file
const axios = require('axios');     //Http request


// Get all forms
const getForms = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM forms ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch forms' });
    }
  };


  // Lấy forms theo phân trang
  const getFormsByPage = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;
  
    try {
      const countResult = await pool.query('SELECT COUNT(*) FROM forms');
      const totalForms = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalForms / limit);
  
      const result = await pool.query(
        'SELECT * FROM forms ORDER BY id DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
  
      const host = req.protocol + '://' + req.get('host');
      const formsWithFilePath = result.rows.map(form => ({
        ...form,
        filePath: `${req.protocol}://${req.get('host')}/uploads/${form.file_path}`

      }));
  
      res.json({
        forms: formsWithFilePath,
        totalPages,
      });
    } catch (error) {
      console.error('Error fetching paginated forms:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

const getEmbedding = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) 
      return res.status(400).json({ error: 'Missing text' });

    const result = await axios.post(EMBEDDING_API, { text });

    if (!result.data || !Array.isArray(result.data.embedding)) {
      return res.status(500).json({ error: 'Invalid embedding response' });
    }

    res.json({ embedding: result.data.embedding });

  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to get embedding', 
      details: err.message 
    });
  }
};

// API lấy nội dung của file theo ID
const getFormById = async (req, res) => {
  const { id } = req.params; // Lấy id từ URL
  try {
    const result = await pool.query('SELECT * FROM forms WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = result.rows[0];  // Lấy thông tin file từ cơ sở dữ liệu

    // Tạo đường dẫn đầy đủ đến file
    const host = req.protocol + '://' + req.get('host'); // http://localhost:5000
    const filePath = `${req.protocol}://${req.get('host')}/uploads/${file.file_path}`;


    res.json({
      title: file.title,
      content: file.content, 
      filePath: filePath  
    });
  } catch (err) {
    console.error('Error fetching file:', err);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
};


  module.exports = { 
    getForms,
    getFormsByPage,
    getEmbedding,
    getFormById
};