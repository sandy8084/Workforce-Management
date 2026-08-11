const pool = require('../config/db');

// Get notifications relevant to the logged-in user (by role or by their own ID)
const getMyNotifications = async (req, res) => {
  const { employee_id, role } = req.user;
  try {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE recipient_id = $1 OR recipient_role = $2
       ORDER BY created_at DESC LIMIT 20`,
      [employee_id, role]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Delete all of the logged-in user's notifications
const clearAll = async (req, res) => {
  const { employee_id, role } = req.user;
  try {
    await pool.query(
      `DELETE FROM notifications WHERE recipient_id = $1 OR recipient_role = $2`,
      [employee_id, role]
    );
    res.json({ message: 'Notifications cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { getMyNotifications, markAsRead, clearAll};