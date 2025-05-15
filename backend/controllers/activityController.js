const pool = require('../db');

const addActivity = async (req, res) => {
    try {
        const { user_id, type, description } = req.body;

        if (!user_id || !type) {
            return res.status(400).json({ error: 'Thiếu user_id hoặc type' });
        }

        await pool.query(
            `INSERT INTO activities (user_id, type, description)
             VALUES ($1, $2, $3)`,
            [user_id, type, description || ""]
        );

        res.json({ message: 'Đã ghi activity thành công' });
    } catch (err) {
        console.error("Lỗi khi ghi activity:", err.message);
        res.status(500).json({ error: 'Không thể ghi activity' });
    }
};


const getActivitiesByUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await pool.query(
            `SELECT type, description, time FROM activities 
             WHERE user_id = $1 
             ORDER BY time DESC 
             LIMIT 10`,
            [user_id]
        );

        res.json({ activities: result.rows });
    } catch (err) {
        console.error("Lỗi khi lấy activity:", err.message);
        res.status(500).json({ error: 'Không thể lấy activity' });
    }
};

module.exports = {
    addActivity,
    getActivitiesByUser
};
