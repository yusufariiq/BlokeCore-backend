import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import 'dotenv/config'

import { generateToken } from '../config/auth.js';
import { OAuth2Client } from 'google-auth-library';

import resetPasswordEmailTemplate from '../utils/resetPasswordTemplate.js';

const FRONTEND_URL = process.env.FRONTEND_URL
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const client = new OAuth2Client(CLIENT_ID);

const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`Password must be at least ${minLength} characters long`);
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character');

    return errors;
};


const signupUser = async (req, res) => {
    try {
        const { 
            firstName,
            lastName,
            email,
            password,
            phoneNumber,
            agreedToPolicy,
        } = req.body;

        const errors = {};

        if (!firstName || firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters long';
        }
        if (!lastName || lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters long';
        }
        if (!email || !validator.isEmail(email)) {
            errors.email = 'Please provide a valid email address';
        }
        if (!agreedToPolicy) {
            errors.policy = 'You must agree to the privacy policy';
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            errors.password = passwordErrors;
        }

        if (!firstName || !lastName || !email || !password || !phoneNumber) {
            return res.status(400).json({ 
            errors: { 
                general: 'All fields are required' 
            } 
            });
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }
  
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
            errors: { 
                email: 'Email is already registered' 
            } 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
  
        // Create new user
        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phoneNumber,
            agreedToPolicy,
            provider: 'local'
        });
  
        await newUser.save();
    
        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber
            }
        });
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: "Registration failed. Please try again." });
    }
  };

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                errors: { 
                    general: 'Please provide both email and password' 
                }
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = generateToken(user._id);
        
        res.status(200).json({ 
            msg: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
}

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name } = payload;

        let user = await userModel.findOne({ email });
        
        if (!user) {
            user = new userModel({
                email,
                firstName: given_name,
                lastName: family_name,
                agreedToPolicy: true,
                provider: 'google'
            });
            await user.save();
        }

        const authToken = generateToken(user);

        res.status(200).json({
            user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            requirePhoneNumber: !user.phoneNumber && user.provider === 'local'
            },
            token: authToken
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ 
            error: "Google authentication failed. Please try again later." 
        });
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        const errors = {};

        if (updateData.firstName !== undefined && updateData.firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters long';
        }

        if (updateData.lastName !== undefined && updateData.lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters long';
        }

        if (updateData.email !== undefined) {
            if (!validator.isEmail(updateData.email)) {
                errors.email = 'Please provide a valid email address';
            } else {
                const existingUser = await userModel.findOne({ 
                    email: updateData.email,
                    _id: { $ne: userId }
                });
                if (existingUser) {
                    errors.email = 'Email is already in use';
                }
            }
        }

        if (updateData.phoneNumber === '') {
            errors.phoneNumber = 'Please provide a valid phone number';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            msg: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber
            }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile. Please try again.' });
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user){
            return res.status(404).json({ message: 'User not found.'})
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: EMAIL_USER, 
                pass: EMAIL_PASS,
            },
        });

        const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`
        const emailHtml = resetPasswordEmailTemplate(resetLink);

        await transporter.sendMail({
            from: EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: emailHtml,
        });

        res.status(200).json({ message: 'Reset link sent to your email.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error occurred while processing password reset.' });
    }
}

const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        return res.status(400).json({ message: 'Token and new password are required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ 
                message: 'Invalid password',
                errors: passwordErrors 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }
        res.status(500).json({ message: 'Server error occurred while resetting password' });
    }
}

export { loginUser, signupUser, googleAuth, updateProfile, forgotPassword, resetPassword };