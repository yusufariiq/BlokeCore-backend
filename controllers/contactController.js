import contactModel from "../models/contactModel.js";
import { nanoid } from "nanoid";

const addMessage = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            message,
        } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                missingFields: {
                    name: !name,
                    email: !email,
                    message: !message
                }
            });
        }

        const newContactMessage = new contactModel({
            contactId: `MSG-${nanoid(4)}-${nanoid(6)}`, 
            name,
            email,
            phoneNumber: phoneNumber || '',
            message,
            submittedAt: Date.now()
        });

        try {
            await newContactMessage.save();
            res.status(201).json({
                message: 'Message sent successfully',
            });
        } catch (saveError) {
            console.error('Save Error:', saveError);
            res.status(500).json({ 
                message: 'Error saving message',
                error: saveError.message,
                validationErrors: saveError.errors
            });
        }
    } catch (error) {
        console.error('Unexpected Error:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again later.',
            error: error.message 
        });
    }
}

const listMessage = async (req, res) => {
    try {
        const messages = await contactModel.find({});
        res.json({success: true, messages});
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

export { 
    addMessage,
    listMessage,
};