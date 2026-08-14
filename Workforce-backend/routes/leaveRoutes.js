const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const { applyLeave, getMyBalance, getMyLeaves, getAllLeaves, respondToLeave } = require('../controllers/leaveController');

router.post('/', verifyToken, applyLeave);
router.get('/me/balance', verifyToken, getMyBalance);
router.get('/me', verifyToken, getMyLeaves);
router.get('/', verifyToken, allowRoles('HR'), getAllLeaves);
router.put('/:leave_no/respond', verifyToken, allowRoles('HR'), respondToLeave);

module.exports = router;