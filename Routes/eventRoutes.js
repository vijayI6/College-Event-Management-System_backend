import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getAllEvents,
    registerForEvent,
    cancelEventRegistration,
    seedEvents,
} from '../controllers/eventController.js';

const router = express.Router();

// Public route to get all events
router.get('/', getAllEvents);

// Public route to seed database with events (handles GET and POST for convenience)
router.route('/seed').get(seedEvents).post(seedEvents);

// Protected routes for event actions
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/cancel', protect, cancelEventRegistration);

export default router;
