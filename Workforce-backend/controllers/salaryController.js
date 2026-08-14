const pool = require('../config/db');

// HR: get salary history for any employee
const getSalaryByEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM salaries WHERE employee_id = $1 ORDER BY effective_date DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// EMPLOYEE: get their own current salary
const getMySalary = async (req, res) => {
  const { employee_id } = req.user;
  try {
    const result = await pool.query(
      `SELECT * FROM salaries WHERE employee_id = $1 ORDER BY effective_date DESC LIMIT 1`,
      [employee_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No salary record found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// HR: add a new salary entry (e.g., a raise)
const addSalary = async (req, res) => {
  const { employee_id, basic_salary, hra, effective_date } = req.body;
  const net_salary = Number(basic_salary) + Number(hra);

  try {
    await pool.query(
      `INSERT INTO salaries (employee_id, basic_salary, hra, net_salary, effective_date) VALUES ($1, $2, $3, $4, $5)`,
      [employee_id, basic_salary, hra, net_salary, effective_date]
    );
    res.status(201).json({ message: 'Salary entry added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getMySalaryHistory = async (req, res) => {
  const { employee_id } = req.user;
  try {
    const result = await pool.query(
      `SELECT * FROM salaries WHERE employee_id = $1 ORDER BY effective_date DESC`,
      [employee_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// HR: get current salary for ALL employees (latest entry per person)
const getAllCurrentSalaries = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (s.employee_id) s.*, e.full_name, e.department_name
      FROM salaries s
      JOIN employees e ON s.employee_id = e.employee_id
      ORDER BY s.employee_id, s.effective_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// HR: update an existing salary entry
const updateSalary = async (req, res) => {
  const { id } = req.params;
  const { basic_salary, hra, effective_date } = req.body;
  const net_salary = Number(basic_salary) + Number(hra);

  try {
    const result = await pool.query(
      `UPDATE salaries SET basic_salary = $1, hra = $2, net_salary = $3, effective_date = $4
       WHERE id = $5 RETURNING *`,
      [basic_salary, hra, net_salary, effective_date, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Salary entry not found' });
    res.json({ message: 'Salary entry updated', salary: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// HR: delete a salary entry
const deleteSalary = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM salaries WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Salary entry not found' });
    res.json({ message: 'Salary entry deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { getSalaryByEmployee, getMySalary, addSalary, getMySalaryHistory, getAllCurrentSalaries, updateSalary, deleteSalary };