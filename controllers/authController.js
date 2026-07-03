import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'college_event_system_secret_key_123_456', {
        expiresIn: '30d',
    });
};


export const registerUser = async (req, res) => {
    try {
        const { name, email, studentId, password } = req.body;

        // Check if all fields are provided
        if (!name || !email || !studentId || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all fields (Name, Email, Student ID, Password)' 
            });
        }

        // Check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'Campus email is already registered' 
            });
        }

        // Check if studentId already exists
        const studentIdExists = await User.findOne({ studentId });
        if (studentIdExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student ID/Roll Number is already registered' 
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            studentId,
            password
        });

        if (user) {
            res.status(201).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    studentId: user.studentId,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Invalid user data provided' 
            });
        }
    } catch (error) {
        console.error('Registration Error details:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error occurred during registration' 
        });
    }
};


export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if credentials are provided
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide both email and password' 
            });
        }

        // Find user by email
        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && (await user.comparePassword(password))) {
            res.status(200).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    studentId: user.studentId,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Server error occurred during login' 
        });
    }
};


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user registered with this email address'
            });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and save to user
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 mins

        await user.save();

        // Create reset url
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // Create email message
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click on the link below, or paste this into your browser to complete the process:\n\n${resetUrl}`;
        const html = `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1e293b;">
                <h2 style="color: #3b82f6; text-align: center; margin-bottom: 24px;">Reset Your Password</h2>
                <p>Hello,</p>
                <p>You requested to reset your password for your CampusEvents account. Please click the button below to set a new password:</p>
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${resetUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                  </div>
                <p>This password reset link will expire in 30 minutes.</p>
                <p>If you did not request this reset, you can safely ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 12px; color: #64748b; text-align: center;">CampusEvents - College Event Management System</p>
            </div>
        `;

        let mailResult = { previewUrl: null };
        try {
            mailResult = await sendEmail({
                to: user.email,
                subject: 'CampusEvents - Password Reset Request',
                text: message,
                html: html
            });
        } catch (err) {
            console.error('Email could not be sent:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please check backend logs or try again later.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Email sent successfully',
            ...(process.env.NODE_ENV !== 'production' ? { resetUrl, previewUrl: mailResult.previewUrl } : {})
        });

    } catch (error) {
        console.error('Forgot Password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred during forgot password request'
        });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Get hashed token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful'
        });

    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred during password reset'
        });
    }
};
