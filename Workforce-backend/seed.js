const pool = require('./config/db');
const bcrypt = require('bcrypt');

const createTestUser = async () => {
  try {
    const plainPassword = 'password123'; // you'll type this when logging in
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Insert into users table
    await pool.query(
      `INSERT INTO users (employee_id, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (employee_id) DO NOTHING`,
      ['EMP002', 'sarah.mitchell@company.com', hashedPassword, 'HR', 'active']
    );

    // Also insert into departments + employees so it has a valid profile
    await pool.query(
      `INSERT INTO departments (department_name) VALUES ($1)
       ON CONFLICT (department_name) DO NOTHING`,
      ['Human Resources']
    );

    await pool.query(
      `INSERT INTO employees (employee_id, full_name, department_name, designation, phone, join_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (employee_id) DO NOTHING`,
      ['EMP002', 'Sarah Mitchell', 'Human Resources', 'HR Manager', '+1-555-0102', '2020-06-01', 'active']
    );

    console.log('Test user created: sarah.mitchell@company.com / password123');
  } catch (err) {
    console.error('Error creating test user:', err);
  } finally {
    pool.end(); // closes the connection so the script exits cleanly
  }
};

createTestUser();