const pool = require('../config/db');

const generateLeaveNo = async () => {
  const result = await pool.query(`SELECT leave_no FROM leaves ORDER BY leave_no DESC LIMIT 1`);
  if (result.rows.length === 0) return 'LV-001';
  const num = parseInt(result.rows[0].leave_no.replace('LV-', ''), 10) + 1;
  return 'LV-' + String(num).padStart(3, '0');
};

// EMPLOYEE: apply for leave
const applyLeave = async (req, res) => {
  const { employee_id } = req.user;
  const { leave_type, from_date, to_date, reason } = req.body;

  try {
    const leave_no = await generateLeaveNo();
    await pool.query(
      `INSERT INTO leaves (leave_no, employee_id, leave_type, from_date, to_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending')`,
      [leave_no, employee_id, leave_type, from_date, to_date, reason]
    );

    await pool.query(
      `INSERT INTO notifications (recipient_role, message, ticket_no) VALUES ('HR', $1, $2)`,
      [`New ${leave_type} leave request ${leave_no}`, leave_no]
    );

    res.status(201).json({ message: `Leave request ${leave_no} submitted`, leave_no });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// EMPLOYEE: view own leave balance
const getMyBalance = async (req, res) => {
  const { employee_id } = req.user;
  try {
    const result = await pool.query(`SELECT * FROM leave_balances WHERE employee_id = $1`, [employee_id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'No balance record found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// EMPLOYEE: view own leave history
const getMyLeaves = async (req, res) => {
  const { employee_id } = req.user;
  try {
    const result = await pool.query(`SELECT * FROM leaves WHERE employee_id = $1 ORDER BY applied_at DESC`, [employee_id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// HR: view all leave requests
const getAllLeaves = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, e.full_name FROM leaves l
      JOIN employees e ON l.employee_id = e.employee_id
      ORDER BY l.applied_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// HR: approve or reject, and deduct balance if approved (only for Casual/Sick)
const respondToLeave = async (req, res) => {
  const { leave_no } = req.params;
  const { status } = req.body; // 'Approved' or 'Rejected'

  try {
    const leaveResult = await pool.query(`SELECT * FROM leaves WHERE leave_no = $1`, [leave_no]);
    if (leaveResult.rows.length === 0) return res.status(404).json({ message: 'Leave not found' });
    const leave = leaveResult.rows[0];

    const from = new Date(leave.from_date + 'T00:00:00Z');
    const to = new Date(leave.to_date + 'T00:00:00Z');
    const days = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)));

    await pool.query(`UPDATE leaves SET status = $1 WHERE leave_no = $2`, [status, leave_no]);

    if (status === 'Approved' && leave.leave_type === 'Casual') {
      await pool.query(`UPDATE leave_balances SET casual_used = casual_used + $1 WHERE employee_id = $2`, [days, leave.employee_id]);
    }
    if (status === 'Approved' && leave.leave_type === 'Sick') {
      await pool.query(`UPDATE leave_balances SET sick_used = sick_used + $1 WHERE employee_id = $2`, [days, leave.employee_id]);
    }
    // Emergency leave: no balance deduction (unlimited)

    await pool.query(
      `INSERT INTO notifications (recipient_id, message, ticket_no) VALUES ($1, $2, $3)`,
      [leave.employee_id, `Your leave request ${leave_no} was ${status.toLowerCase()}`, leave_no]
    );

    res.json({ message: `Leave ${status.toLowerCase()}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { applyLeave, getMyBalance, getMyLeaves, getAllLeaves, respondToLeave };