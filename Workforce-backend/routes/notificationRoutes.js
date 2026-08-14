const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getMyNotifications, markAsRead, clearAll } = require('../controllers/notificationController');

router.get('/', verifyToken, getMyNotifications);
router.put('/:id/read', verifyToken, markAsRead);
router.delete('/clear-all', verifyToken, clearAll);

module.exports = router;