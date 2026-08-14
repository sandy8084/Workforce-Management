const pool = require('../config/db');

const getAllDepartments = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departments ORDER BY department_name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const createDepartment = async (req, res) => {
  const { department_name } = req.body;
  try {
    await pool.query(
      `INSERT INTO departments (department_name) VALUES ($1)
       ON CONFLICT (department_name) DO NOTHING`,
      [department_name]
    );
    res.status(201).json({ message: 'Department created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteDepartment = async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM departments WHERE department_name = $1 RETURNING *', [name]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// HR: rename a department (updates the name everywhere it's referenced)
const renameDepartment = async (req, res) => {
  const { name } = req.params;
  const { new_name } = req.body;

  try {
    // Update the departments table itself
    await pool.query(
      `UPDATE departments SET department_name = $1 WHERE department_name = $2`,
      [new_name, name]
    );
    // Update every employee referencing the old name
    await pool.query(
      `UPDATE employees SET department_name = $1 WHERE department_name = $2`,
      [new_name, name]
    );
    res.json({ message: 'Department renamed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
module.exports = { getAllDepartments, createDepartment, deleteDepartment, renameDepartment };