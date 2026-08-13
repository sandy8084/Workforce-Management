const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find the user by email, joined with employees to get their name
    const result = await pool.query(
      `SELECT u.*, e.full_name, e.gender FROM users u
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // 2. Compare entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // 3. Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    // 4. Create JWT token with role baked in
    const token = jwt.sign(
      { employee_id: user.employee_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 5. Send token + basic user info back
    res.json({
      token,
      user: {
        employee_id: user.employee_id,
        full_name: user.full_name,
        gender: user.gender,
        email: user.email,
        role: user.role,
        must_change_password: user.must_change_password,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const { employee_id } = req.user;
  const { new_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query(
      `UPDATE users SET password_hash = $1, must_change_password = false WHERE employee_id = $2`,
      [hashedPassword, employee_id]
    );
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, changePassword };