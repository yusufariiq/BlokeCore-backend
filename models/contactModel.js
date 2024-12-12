import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    contactId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: false,
    },
    message: {
        type: String,
        required: true,
    },
    submittedAt: { 
        type: Date, 
        default: Date.now
    },
})

const contactModel = mongoose.models.contact || mongoose.model('contact', contactSchema);

export default contactModel