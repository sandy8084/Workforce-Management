const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const { getAllDepartments, createDepartment, deleteDepartment, renameDepartment } = require('../controllers/departmentController');

// Anyone logged in can view departments (needed for dropdowns in forms)
router.get('/', verifyToken, getAllDepartments);
router.put('/:name', verifyToken, allowRoles('HR'), renameDepartment);
// Only HR can create/delete departments
router.post('/', verifyToken, allowRoles('HR'), createDepartment);
router.delete('/:name', verifyToken, allowRoles('HR'), deleteDepartment);

module.exports = router;