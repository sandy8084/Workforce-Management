const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const { getSalaryByEmployee, getMySalary, addSalary, getMySalaryHistory, getAllCurrentSalaries, updateSalary, deleteSalary } = require('../controllers/salaryController');

router.get('/me', verifyToken, getMySalary);
router.get('/me/history', verifyToken, getMySalaryHistory);
router.get('/all/current', verifyToken, allowRoles('HR'), getAllCurrentSalaries);
router.get('/:id', verifyToken, allowRoles('HR'), getSalaryByEmployee);
router.post('/', verifyToken, allowRoles('HR'), addSalary);
router.put('/:id', verifyToken, allowRoles('HR'), updateSalary);
router.delete('/:id', verifyToken, allowRoles('HR'), deleteSalary);

module.exports = router;
