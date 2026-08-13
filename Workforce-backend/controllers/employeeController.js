const pool = require('../config/db');
const bcrypt = require('bcrypt');

const generateEmployeeId = async () => {
  const result = await pool.query(
    `SELECT employee_id FROM employees ORDER BY employee_id DESC LIMIT 1`
  );
  if (result.rows.length === 0) return 'EMP001';

  const lastId = result.rows[0].employee_id;
  const num = parseInt(lastId.replace('EMP', ''), 10) + 1;
  return 'EMP' + String(num).padStart(3, '0');
};

// GET all employees
const getAllEmployees = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.employee_id, e.full_name, e.department_name, e.designation,
             e.phone, e.join_date, e.exit_date, e.status, u.email, u.role
      FROM employees e
      JOIN users u ON e.employee_id = u.employee_id
      ORDER BY e.employee_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single employee by id
const getEmployeeById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT e.*, u.email, u.role FROM employees e
       JOIN users u ON e.employee_id = u.employee_id
       WHERE e.employee_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE employee (also creates their login user)
const DEFAULT_PASSWORD = 'Welcome@123';

const createEmployee = async (req, res) => {
  const {
    full_name, email, role,
    department_name, designation, phone, join_date,
    date_of_birth, address, gender, emergency_contact_name, emergency_contact_phone, blood_group
  } = req.body;

  try {
    const employee_id = await generateEmployeeId();
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    await pool.query(
      `INSERT INTO users (employee_id, email, password_hash, role, status, must_change_password)
       VALUES ($1, $2, $3, $4, 'active', true)`,
      [employee_id, email, hashedPassword, role]
    );

    await pool.query(
      `INSERT INTO employees (
        employee_id, full_name, department_name, designation, phone, join_date, status,
        date_of_birth, address, gender, emergency_contact_name, emergency_contact_phone, blood_group
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10, $11, $12)`,
      [employee_id, full_name, department_name, designation, phone, join_date,
       date_of_birth || null, address || null, gender || null,
       emergency_contact_name || null, emergency_contact_phone || null, blood_group || null]
    );
    // ADD THIS LINE — creates their leave balance with default quotas
    await pool.query(`INSERT INTO leave_balances (employee_id) VALUES ($1)`, [employee_id]);
    res.status(201).json({
      message: `Employee ${employee_id} created successfully. Default password: ${DEFAULT_PASSWORD}`,
      employee_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// UPDATE employee
const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { full_name, department_name, designation, phone, status, exit_date } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees
       SET full_name = $1, department_name = $2, designation = $3, phone = $4, status = $5, exit_date = $6
       WHERE employee_id = $7 RETURNING *`,
      [full_name, department_name, designation, phone, status, exit_date || null, id]
    );

    // If deactivating, also lock their login
    if (status === 'inactive') {
      await pool.query(`UPDATE users SET status = 'inactive' WHERE employee_id = $1`, [id]);
    } else if (status === 'active') {
      await pool.query(`UPDATE users SET status = 'active' WHERE employee_id = $1`, [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee updated', employee: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE employee (deletes user too, since employees references users)
const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE employee_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// EMPLOYEE: get their own profile
const getMyProfile = async (req, res) => {
  const { employee_id } = req.user;
  try {
    const result = await pool.query(
      `SELECT e.*, u.email, u.role FROM employees e
       JOIN users u ON e.employee_id = u.employee_id
       WHERE e.employee_id = $1`,
      [employee_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// EMPLOYEE: update their own personal details
const updateMyProfile = async (req, res) => {
  const { employee_id } = req.user;
  const { date_of_birth, address, gender, emergency_contact_name, emergency_contact_phone, blood_group, phone } = req.body;

  try {
    const result = await pool.query(
      `UPDATE employees
       SET date_of_birth = $1, address = $2, gender = $3,
           emergency_contact_name = $4, emergency_contact_phone = $5, blood_group = $6, phone = $7
       WHERE employee_id = $8 RETURNING *`,
      [date_of_birth || null, address || null, gender || null,
       emergency_contact_name || null, emergency_contact_phone || null, blood_group || null, phone,
       employee_id]
    );
    res.json({ message: 'Profile updated successfully', employee: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const uploadProfilePicture = async (req, res) => {
  const { employee_id } = req.user;
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    await pool.query(
      `UPDATE employees SET profile_picture = $1 WHERE employee_id = $2`,
      [req.file.filename, employee_id]
    );
    res.json({ message: 'Profile picture updated', profile_picture: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { generateEmployeeId, getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getMyProfile, updateMyProfile, uploadProfilePicture };