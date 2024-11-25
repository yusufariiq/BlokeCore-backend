import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { generateToken } from '../config/auth.js';

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

const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^08\d{8,11}$/;
    return phoneRegex.test(phoneNumber);
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
        if (!phoneNumber || !validatePhoneNumber(phoneNumber)) {
            errors.phoneNumber = 'Please provide a valid Indonesian phone number starting with 08';
        }
        if (!agreedToPolicy) {
            errors.policy = 'You must agree to the privacy policy';
        }

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            errors.password = passwordErrors;
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
        
        const token = generateToken(newUser._id);
        
        res.status(201).json({ 
            msg: "User registered successfully",
            token,
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
}

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
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: "Login failed. Please try again." });
    }
}

const loginAdmin = async (req, res) => {
    
}

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ 
                errors: { 
                    token: 'Google token is required' 
                }
            });
        }

        const payload = await verifyGoogleToken(token);
        
        let user = await userModel.findOne({ email: payload.email });
        
        if (!user) {
            user = new userModel({
                firstName: payload.given_name,
                lastName: payload.family_name,
                email: payload.email,
                password: await bcrypt.hash(Math.random().toString(36), 10),
                phoneNumber: '',
                agreedToPolicy: true,
                provider: 'google'
            });
            await user.save();
        }

        const jwtToken = generateToken(user._id);

        res.status(200).json({
            msg: "Google authentication successful",
            token: jwtToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
            }
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

        if (updateData.phoneNumber !== undefined && !validatePhoneNumber(updateData.phoneNumber)) {
            errors.phoneNumber = 'Please provide a valid Indonesian phone number starting with 08';
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

export { loginUser, signupUser, loginAdmin, googleAuth, updateProfile };