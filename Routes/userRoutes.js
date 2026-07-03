import express from 'express';
import { registerUser, loginUser, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
} from '../controllers/userController.js';

const router = express.Router();

// Public auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile/update', protect, updateUserProfile);
router.put('/profile/password', protect, changeUserPassword);

export default router;
