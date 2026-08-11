const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const {
  getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, getMyProfile, updateMyProfile
} = require('../controllers/employeeController');

// All routes require login, and only HR can access them
router.get('/me', verifyToken, getMyProfile);
router.get('/me', verifyToken, getMyProfile);
router.put('/me', verifyToken, updateMyProfile);   // ← must come BEFORE /:id routes

router.get('/', verifyToken, allowRoles('HR'), getAllEmployees);
router.get('/:id', verifyToken, allowRoles('HR'), getEmployeeById);
router.post('/', verifyToken, allowRoles('HR'), createEmployee);
router.put('/:id', verifyToken, allowRoles('HR'), updateEmployee);   // ← this was catching "me" before
router.delete('/:id', verifyToken, allowRoles('HR'), deleteEmployee);
module.exports = router;