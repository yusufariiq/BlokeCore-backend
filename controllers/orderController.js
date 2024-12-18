import Order from '../models/orderModel.js';
import user from '../models/userModel.js'
import midtransClient from 'midtrans-client'
import { nanoid } from "nanoid";
import { updateProductStock } from './productController.js';

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY

const snap = new midtransClient.Snap({
    isProduction: false,
    serverKey: SERVER_KEY,
    clientKey: CLIENT_KEY,
})

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

        for (const item of items) {
            try {
                await updateProductStock(item.id, item.quantity);
            } catch (stockError) {
                return res.status(400).json({
                    success: false,
                    message: `Stock update failed for product ${item.id}: ${stockError.message}`
                });
            }
        }

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

        const transactionDetails = {
            transaction_details: {
                order_id: newOrder.orderId,
                gross_amount: roundedAmount,
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
                    price: Math.round(item.price),
                    quantity: item.quantity,
                    name: item.name,
                })),
                {
                    id: 'shipping',
                    price: roundedShippingPrice,
                    quantity: 1,
                    name: 'Shipping Cost'
                }
            ]
        };

        console.log(transactionDetails);

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

        for (const item of items) {
            try {
                await updateProductStock(item.id, item.quantity);
            } catch (stockError) {
                return res.status(400).json({
                    success: false,
                    message: `Stock update failed for product ${item.id}: ${stockError.message}`
                });
            }
        }

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

const userOrders = async (req, res) => {
    try {
        const { userId } = req.body;
        const orders = await Order.find({ userId });
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

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

const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ 
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
    getOrderDetails
}