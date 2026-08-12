const pool = require('../config/db');
const prefixMap = {
  Laptop: 'ASTL',
  Desktop: 'ASTD',
  Monitor: 'ASTM',
  Headset: 'ASTH',
  Keyboard: 'ASTK',
  Mouse: 'ASTU',
  Webcam: 'ASTW',
};

const generateAssetTag = async (category) => {
  const prefix = prefixMap[category];
  const result = await pool.query(
    `SELECT asset_tag FROM assets WHERE asset_tag LIKE $1 ORDER BY asset_tag DESC LIMIT 1`,
    [`${prefix}-%`]
  );
  if (result.rows.length === 0) return `${prefix}-001`;

  const lastTag = result.rows[0].asset_tag; // e.g. 'ASTL-005'
  const num = parseInt(lastTag.split('-')[1], 10) + 1;
  return `${prefix}-${String(num).padStart(3, '0')}`;
};
// GET all assets
const getAllAssets = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, e.full_name AS assigned_to_name
      FROM assets a
      LEFT JOIN employees e ON a.assigned_to = e.employee_id
      ORDER BY a.asset_tag
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET single asset
const getAssetById = async (req, res) => {
  const { tag } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, e.full_name AS assigned_to_name
       FROM assets a
       LEFT JOIN employees e ON a.assigned_to = e.employee_id
       WHERE a.asset_tag = $1`,
      [tag]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE asset
const createAsset = async (req, res) => {
  const { category, model, serial_number, status, assigned_to, brand, vendor, purchase_date, ram, storage, processor, installed_os } = req.body;
  try {
    const asset_tag = await generateAssetTag(category);
    await pool.query(
      `INSERT INTO assets (asset_tag, category, model, serial_number, status, assigned_to, brand, vendor, purchase_date, ram, storage, processor, installed_os)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [asset_tag, category, model, serial_number, status || 'Available', assigned_to || null,
       brand || null, vendor || null, purchase_date || null, ram || null, storage || null, processor || null, installed_os || null]
    );
    res.status(201).json({ message: `Asset ${asset_tag} created successfully`, asset_tag });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE asset (also logs assignment history if assigned_to changes)
const updateAsset = async (req, res) => {
  const { tag } = req.params;
  const { category, status, assigned_to } = req.body;

  try {
    // Get current state before updating, to detect assignment changes
    const current = await pool.query('SELECT * FROM assets WHERE asset_tag = $1', [tag]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    const previousAssignee = current.rows[0].assigned_to;

    const result = await pool.query(
      `UPDATE assets SET category = $1, status = $2, assigned_to = $3
       WHERE asset_tag = $4 RETURNING *`,
      [category, status, assigned_to || null, tag]
    );

    // If assignment changed, log it in asset_assignments
    if (assigned_to && assigned_to !== previousAssignee) {
      await pool.query(
        `INSERT INTO asset_assignments (asset_tag, employee_id, assigned_date)
         VALUES ($1, $2, CURRENT_DATE)`,
        [tag, assigned_to]
      );
    }

    // If asset was unassigned, close out the previous assignment log entry
    if (previousAssignee && assigned_to !== previousAssignee) {
      await pool.query(
        `UPDATE asset_assignments SET returned_date = CURRENT_DATE
         WHERE asset_tag = $1 AND employee_id = $2 AND returned_date IS NULL`,
        [tag, previousAssignee]
      );
    }

    res.json({ message: 'Asset updated', asset: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE asset
const deleteAsset = async (req, res) => {
  const { tag } = req.params;
  try {
    const result = await pool.query('DELETE FROM assets WHERE asset_tag = $1 RETURNING *', [tag]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Asset not found' });
    }
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getMyAssets = async (req, res) => {
  const { employee_id } = req.user;
  try {
    const result = await pool.query(
      `SELECT * FROM assets WHERE assigned_to = $1 ORDER BY asset_tag`,
      [employee_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// GET all assignment history (IT Admin only)
const getAllAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT aa.*, a.category, e.full_name AS employee_name
      FROM asset_assignments aa
      JOIN assets a ON aa.asset_tag = a.asset_tag
      JOIN employees e ON aa.employee_id = e.employee_id
      ORDER BY aa.assigned_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// IT: get stock counts grouped by category
const getStockSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Available') as available,
        COUNT(*) FILTER (WHERE status = 'Assigned') as assigned
      FROM assets
      GROUP BY category
      ORDER BY category
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
module.exports = { generateAssetTag, getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset, getMyAssets, getAllAssignments, getStockSummary};