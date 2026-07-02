import express from 'express';
import userRoutes from './userRoutes.js';
import eventRoutes from './eventRoutes.js';

const router = express.Router();

// Mount user-related auth routes at /users
router.use('/users', userRoutes);

// Mount event-related routes at /events
router.use('/events', eventRoutes);

export default router;
