import Order from '../models/orderModel.js';
import user from '../models/userModel.js'
import { nanoid } from "nanoid";
import midtransClient from 'midtrans-client'

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY

// initialize Midtrans snap API
const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: SERVER_KEY,
    clientKey: CLIENT_KEY,
})

// order payment with midtrans
const placeOrderMidtrans = async (req, res) => {
    try {
        const { 
            userId,
            items,
            amount,
            shippingAddress,
            paymentMethod,
            selectedShipping,
            shippingPrice
        } = req.body;

        // Round amount and prices to whole numbers
        const roundedAmount = Math.round(amount);
        const roundedShippingPrice = Math.round(shippingPrice);

        const newOrder = new Order({
            orderId: `TRX-${nanoid(4)}-${nanoid(6)}`, 
            userId,
            items,
            amount: roundedAmount,
            shippingPrice: roundedShippingPrice,
            shippingAddress,
            selectedShipping,
            status: 'Order Placed',
            paymentMethod: paymentMethod,
            payment: true,
            date: Date.now()
        });

        // Generate midtrans transaction details
        const transactionDetails = {
            transaction_details: {
                order_id: newOrder.orderId,
                gross_amount: roundedAmount, // Ensure whole number
            },
            customer_details: {
                first_name: shippingAddress.firstName,
                last_name: shippingAddress.lastName,
                email: shippingAddress.email,
                phone: shippingAddress.phone,
            },
            item_details: [
                ...items.map((item) => ({
                    id: item.id,
                    price: Math.round(item.price), // Round item prices
                    quantity: item.quantity,
                    name: item.name,
                })),
                {
                    id: 'shipping',
                    price: roundedShippingPrice, // Round shipping price
                    quantity: 1,
                    name: 'Shipping Cost'
                }
            ]
        };

        console.log(transactionDetails);

        // create midtrans transaction
        const transaction = await snap.createTransaction(transactionDetails);

        await newOrder.save();

        res.status(201).json({
            success: true,
            order: newOrder,
            token: transaction.token,
        });
    } catch (error) {
        console.error('Midtrans Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Midtrans transaction',
        });
    }
}

// order payment with COD
const placeOrder = async (req, res) => {
    try {
        const { 
            userId, 
            items, 
            amount, 
            shippingAddress, 
            paymentMethod, 
            shippingPrice,
            selectedShipping,
        } = req.body;

        const newOrder = new Order({
            orderId: `TRX-${nanoid(4)}-${nanoid(6)}`, 
            userId,
            items,
            amount,
            shippingPrice,
            shippingAddress,
            selectedShipping,
            status: 'Pending',
            paymentMethod: paymentMethod,
            date: Date.now()
        });

        await newOrder.save();
        await user.findByIdAndUpdate(userId,{cartData: {}})

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
    placeOrderMidtrans,
    allOrders,
    userOrders,
    updateStatus,
}