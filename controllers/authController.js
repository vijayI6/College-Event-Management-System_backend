import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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
