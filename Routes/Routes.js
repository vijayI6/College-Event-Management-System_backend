import express from 'express';
import userRoutes from './userRoutes.js';

const router = express.Router();

// Mount user-related auth routes at /users
router.use('/users', userRoutes);

export default router;
