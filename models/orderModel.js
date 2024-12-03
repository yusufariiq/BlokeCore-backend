import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    items: {
        type: Array,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    shippingAddress: {
        email: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        zipCode: {
            type: String,
            required: true,
        },
    },
    status: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    payment: {
        type: Boolean,
        required: true,
        default: false,
    },
    date: {
        type: Number,
        required: true,
    },
})

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel