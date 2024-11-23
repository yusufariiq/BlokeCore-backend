import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: { 
        type: String,
        required: true,
        trim: true
    },
    lastName: { 
        type: String,
        required: true,
        trim: true
    },
    email: { 
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    agreedToPolicy: {
        type: Boolean,
        default: false
    },
    cartData: { 
        type: Object,
        default: {}
    },
    provider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
}, {
    timestamps: true,
    minimize: false
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;