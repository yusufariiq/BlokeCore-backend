import Order from '../models/orderModel.js';
import user from '../models/userModel.js'

// order payment with BCA & COD
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, shippingAddress, paymentMethod, date } = req.body;

        const newOrder = new Order({
            userId,
            items,
            amount,
            shippingAddress,
            status: 'Pending',
            paymentMethod,
            date: Date.now()
        });

        await newOrder.save();
        await user.findByIdAndUpdate(userId,{cartData: {}})

        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// order payment with stripe
const placeOrderStripe = async (req, res) => {
    try {
        const { userId, items, amount, shippingAddress, paymentMethod, date } = req.body;
    
        const newOrder = new Order({
            userId,
            items,
            amount,
            shippingAddress,
            status: 'Pending',
            paymentMethod,
            payment: true,
            date: Date.now(),
        });
    
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// all order in admin dashboard
const allOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
        res.status(200).json({
            success: true,
            orders: orders
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

// user particular orders in frontend
const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({ userId });
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// update order status
const updateStatus = async(req, res) => {
    try {
        const { orderId, status } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true } );
        res.status(200).json({
            success: true,
            order: order
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
}

export {
    placeOrder,
    placeOrderStripe,
    allOrders,
    userOrders,
    updateStatus,
}