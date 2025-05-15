const pool = require('../db');
const fs = require('fs');
const path = require('path');

// ✅ Ghi log upload hoặc delete
const logUploadOrDelete = async (req, res) => {
  try {
    const { filename, status, user_id } = req.body;

    if (!filename || !status || !user_id) {
      return res.status(400).json({ message: 'Thiếu thông tin cần thiết để ghi log.' });
    }

    const result = await pool.query(
      'INSERT INTO upload_logs (filename, user_id, status) VALUES ($1, $2, $3) RETURNING *',
      [filename, user_id, status]
    );

    res.status(201).json({ message: 'Đã ghi log upload/delete', log: result.rows[0] });
  } catch (err) {
    console.error('❌ Lỗi ghi log:', err);
    res.status(500).json({ message: 'Lỗi ghi log' });
  }
};

// ✅ Lấy lịch sử upload/delete (dùng cho admin)
const getUploadLogs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.id, l.filename, l.status, l.created_at AS date, u.name AS user_name,
      EXISTS (
        SELECT 1 FROM upload_logs d
        WHERE d.filename = l.filename AND d.status = 'delete'
      ) AS is_deleted
    FROM upload_logs l
    JOIN users u ON u.id = l.user_id
    ORDER BY l.created_at DESC`
    );
    res.status(200).json({ uploads: result.rows });
  } catch (err) {
    console.error('❌ Lỗi lấy log upload/delete:', err);
    res.status(500).json({ error: 'Không lấy được lịch sử' });
  }
};

// ✅ Xoá file và ghi log delete
const deleteFiles = async (req, res) => {
  const { ids, user_id } = req.body;

  if (!Array.isArray(ids) || ids.length === 0 || !user_id) {
    return res.status(400).json({ error: 'Thiếu danh sách ID hoặc user_id' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, file_path, title FROM forms WHERE id = ANY($1)',
      [ids]
    );

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const file of rows) {
        const fullPath = path.join(__dirname, '..', 'uploads', file.file_path);

        // 🔥 Xóa file vật lý nếu tồn tại
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }

        // 🔥 Xóa khỏi bảng forms
        await client.query('DELETE FROM forms WHERE id = $1', [file.id]);

        // 🔥 Ghi log trạng thái delete
        await client.query(
          'INSERT INTO upload_logs (filename, status, user_id) VALUES ($1, $2, $3)',
          [file.title || file.file_path, 'delete', user_id]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Xóa thành công' });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('❌ Lỗi trong transaction:', e.message);
      res.status(500).json({ error: 'Xoá thất bại trong quá trình xử lý' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Lỗi khi xóa:', err.message);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Ghi log khi người dùng tải file
const logDownload = async (req, res) => {
  const { filename, user_id } = req.body;

  if (!filename || !user_id) {
    return res.status(400).json({ error: 'Thiếu filename hoặc user_id' });
  }

  try {
    await pool.query(
      'INSERT INTO download_logs (filename, user_id) VALUES ($1, $2)',
      [filename, user_id]
    );
    res.status(201).json({ message: 'Đã ghi log tải xuống' });
  } catch (err) {
    console.error('Lỗi ghi log tải xuống:', err);
    res.status(500).json({ error: 'Lỗi máy chủ khi ghi log download' });
  }
};

// ✅ Lấy danh sách file người dùng đã tải
const getDownloadHistory = async (req, res) => {
  const { user_id } = req.body;

  console.log('✅ Nhận user_id:', user_id);

  if (!user_id) {
    return res.status(400).json({ message: 'Thiếu user_id' });
  }

  try {
    const result = await pool.query(
      `SELECT id, filename, downloaded_at AS date
       FROM download_logs
       WHERE user_id = $1
       ORDER BY downloaded_at DESC`,
      [user_id]
    );

    res.json({ downloads: result.rows });
  } catch (err) {
    console.error('❌ Lỗi khi lấy lịch sử tải:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};


module.exports = {
  logUploadOrDelete,
  getUploadLogs,
  deleteFiles,
  logDownload,
  getDownloadHistory
};
