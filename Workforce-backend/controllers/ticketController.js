const pool = require('../config/db');

const generateTicketNo = async () => {
  const result = await pool.query(
    `SELECT ticket_no FROM tickets ORDER BY ticket_no DESC LIMIT 1`
  );
  if (result.rows.length === 0) return 'TKT-001';

  const lastNo = result.rows[0].ticket_no; // e.g. 'TKT-005'
  const num = parseInt(lastNo.replace('TKT-', ''), 10) + 1;
  return 'TKT-' + String(num).padStart(3, '0');
};
// GET tickets — behavior depends on role
const getTickets = async (req, res) => {
  const { role, employee_id } = req.user;

  try {
    let result;

    if (role === 'HR') {
      result = await pool.query(
        `SELECT t.*, e.full_name AS raised_by_name
         FROM tickets t
         JOIN employees e ON t.raised_by = e.employee_id
         WHERE t.category = 'HR'
         ORDER BY t.created_at DESC`
      );
    } else if (role === 'ITADMIN') {
      result = await pool.query(
        `SELECT t.*, e.full_name AS raised_by_name, a.category AS asset_category, a.model AS asset_model
        FROM tickets t
        JOIN employees e ON t.raised_by = e.employee_id
        LEFT JOIN assets a ON t.asset_tag = a.asset_tag
        WHERE t.category = 'IT'
        ORDER BY t.created_at DESC`
      );
    } else {
      // EMPLOYEE - only their own tickets, regardless of category
      result = await pool.query(
        `SELECT * FROM tickets WHERE raised_by = $1 ORDER BY created_at DESC`,
        [employee_id]
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE ticket - any logged-in employee can raise one
const createTicket = async (req, res) => {
  const { employee_id } = req.user;
  const { category, ticket_type, subject, priority, asset_tag } = req.body;

  try {
    const ticket_no = await generateTicketNo();

    await pool.query(
      `INSERT INTO tickets (ticket_no, raised_by, category, ticket_type, subject, priority, status, asset_tag)
       VALUES ($1, $2, $3, $4, $5, $6, 'Open', $7)`,
      [ticket_no, employee_id, category, ticket_type, subject, priority || 'Medium', asset_tag || null]
    );

    await pool.query(
      `INSERT INTO notifications (recipient_role, message, ticket_no)
       VALUES ($1, $2, $3)`,
      [category === 'HR' ? 'HR' : 'ITADMIN', `New ${ticket_type} ticket ${ticket_no} raised`, ticket_no]
    );

    res.status(201).json({ message: `Ticket ${ticket_no} created successfully`, ticket_no });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// UPDATE ticket status - only HR (for HR tickets) or ITADMIN (for IT tickets)
const updateTicketStatus = async (req, res) => {
  const { ticket_no } = req.params;
  const { status } = req.body;
  const { role } = req.user;

  try {
    const ticket = await pool.query('SELECT * FROM tickets WHERE ticket_no = $1', [ticket_no]);
    if (ticket.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const ticketCategory = ticket.rows[0].category;

    // HR can only update HR tickets, ITADMIN can only update IT tickets
    if ((role === 'HR' && ticketCategory !== 'HR') || (role === 'ITADMIN' && ticketCategory !== 'IT')) {
      return res.status(403).json({ message: 'You cannot update tickets outside your category' });
    }

    const result = await pool.query(
      `UPDATE tickets SET status = $1 WHERE ticket_no = $2 RETURNING *`,
      [status, ticket_no]
    );

    res.json({ message: 'Ticket updated', ticket: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// HR/ITADMIN: approve/reject a leave ticket, or reply to a management/IT ticket
const respondToTicket = async (req, res) => {
  const { ticket_no } = req.params;
  const { status, hr_reply } = req.body;
  const { role } = req.user;

  try {
    const ticket = await pool.query('SELECT * FROM tickets WHERE ticket_no = $1', [ticket_no]);
    if (ticket.rows.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const t = ticket.rows[0];
    if ((role === 'HR' && t.category !== 'HR') || (role === 'ITADMIN' && t.category !== 'IT')) {
      return res.status(403).json({ message: 'You cannot update tickets outside your category' });
    }

    const result = await pool.query(
      `UPDATE tickets SET status = $1, hr_reply = $2 WHERE ticket_no = $3 RETURNING *`,
      [status, hr_reply || t.hr_reply, ticket_no]
    );

    // Notify the employee who raised it
    await pool.query(
      `INSERT INTO notifications (recipient_id, message, ticket_no)
       VALUES ($1, $2, $3)`,
      [t.raised_by, `Your ticket ${ticket_no} was updated to "${status}"`, ticket_no]
    );

    res.json({ message: 'Ticket updated', ticket: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { generateTicketNo, getTickets, createTicket, updateTicketStatus, respondToTicket };