const express = require('express');
const router = express.Router();
const { verifyToken, allowRoles } = require('../middleware/authMiddleware');
const { getTickets, createTicket, updateTicketStatus, respondToTicket } = require('../controllers/ticketController');

// Anyone logged in can view tickets (filtered by role inside the controller) and create tickets
router.get('/', verifyToken, getTickets);
router.post('/', verifyToken, createTicket);

// Only HR or ITADMIN can update ticket status
router.put('/:ticket_no', verifyToken, allowRoles('HR', 'ITADMIN'), updateTicketStatus);
router.put('/:ticket_no/respond', verifyToken, allowRoles('HR', 'ITADMIN'), respondToTicket);
module.exports = router;