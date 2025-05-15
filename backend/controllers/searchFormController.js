const axios = require('axios');
require('dotenv').config();

const SEARCH_API = process.env.SEARCH_API || 'http://ai_service:8000/search';

const searchForms = async (req, res) => {
  try {
    // ✅ Hỗ trợ cả `q` và `query` để không bị lỗi với frontend hiện tại
    const query = req.query.q || req.query.query;

    if (!query) {
      return res.status(400).json({ error: 'Thiếu truy vấn tìm kiếm.' });
    }

    const response = await axios.get(SEARCH_API, {
      params: {
        query: query,
        top_k: 5
      }
    });

    const data = response.data;

    // ✅ Định dạng đúng để trả về cho frontend
    return res.status(200).json({
      query,
      totalMatches: data.top_matches.length,
      results: data.top_matches.map(item => ({
        title: item.title,
        file_path: '',
        created_at: new Date()
      }))
    });

  } catch (err) {
    console.error('❌ Search error:', err.message);
    res.status(500).json({ error: 'Lỗi khi tìm kiếm.', detail: err.message });
  }
};

module.exports = { searchForms };
