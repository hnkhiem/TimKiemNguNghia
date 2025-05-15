const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const pool = require('../db');

// Đăng ký người dùng mới
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Tên người dùng, Email và mật khẩu là bắt buộc' });
  }

  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Đăng ký thành công', user: newUser.rows[0] });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ error: 'Lỗi server', details: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email và mật khẩu không được để trống.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Email không tồn tại.' });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Mật khẩu không đúng.' });
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    });
  } catch (err) {
    console.error('Lỗi đăng nhập:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
};

const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Lỗi khi lấy user:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const UpdateInformation = async (req, res) => {
  const { name, email, phone_Number } = req.body;
  const id = req.params.id;

  try {
    await pool.query(
      'UPDATE users SET name = $1, email = $2, phone_number = $3 WHERE id = $4',
      [name, email, phone_Number, id]
    );
    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `INSERT INTO password_resets(email, code, created_at)
       VALUES ($1, $2, NOW()) ON CONFLICT (email)
       DO UPDATE SET code = EXCLUDED.code, created_at = EXCLUDED.created_at`,
      [email, code]
    );

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: 'HUTECH Search <no-reply@hutech.edu.vn>',
      to: email,
      subject: 'Mã xác nhận đặt lại mật khẩu',
      html: `<p>Mã xác nhận của bạn là:</p><h2>${code}</h2><p>Có hiệu lực trong 1 phút.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Đã gửi mã xác nhận tới email.' });
  } catch (error) {
    console.error('Lỗi gửi mã xác nhận:', error);
    res.status(500).json({ message: 'Lỗi máy chủ khi gửi email.' });
  }
};

const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Thiếu email hoặc mã xác nhận' });

  try {
    const result = await pool.query(
      `SELECT * FROM password_resets WHERE email = $1 AND code = $2
       AND created_at >= NOW() - INTERVAL '1 minute'
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Mã xác nhận không hợp lệ hoặc hết hạn' });
    }

    res.status(200).json({ message: 'Mã xác nhận đúng' });
  } catch (err) {
    console.error('Lỗi khi xác minh mã:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    // 1. Kiểm tra mã xác nhận
    const result = await pool.query(
      'SELECT * FROM password_resets WHERE email = $1 AND code = $2 AND created_at >= NOW() - INTERVAL \'1 minutes\' ORDER BY created_at DESC LIMIT 1',
      [email, code]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Mã xác nhận không hợp lệ hoặc hết hạn' });
    }

    // 2. Lấy người dùng hiện tại từ email
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    const user = userResult.rows[0];

    // 3. So sánh mật khẩu mới và mật khẩu cũ
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: 'Mật khẩu mới không được trùng với mật khẩu cũ' });
    }

    // 4. Hash và cập nhật mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

    res.status(200).json({ message: 'Đổi mật khẩu thành công', user_id: user.id });

  } catch (err) {
    console.error('❌ Lỗi đổi mật khẩu:', err);
    res.status(500).json({ message: 'Lỗi máy chủ khi đổi mật khẩu' });
  }
};

module.exports = {
  registerUser,
  getUserById,
  loginUser,
  UpdateInformation,
  forgotPassword,
  verifyCode,
  resetPassword
};
