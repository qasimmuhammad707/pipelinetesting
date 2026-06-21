import express from 'express';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  deleteTicket,
  addComment,
} from '../controllers/ticketController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.route('/').get(getTickets).post(createTicket);
router.route('/:id').get(getTicket).put(updateTicket).delete(deleteTicket);
router.post('/:id/comments', addComment);

export default router;
