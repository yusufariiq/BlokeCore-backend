import express from 'express'
import {
    placeOrder,
    placeOrderStripe,
    allOrders,
    userOrders,
    updateStatus,
} from '../controllers/orderController.js'
import authAdmin from '../middleware/authAdmin.js'
import authenticateUser from '../middleware/authUser.js'

const orderRouter = express.Router()

// Admin features
orderRouter.post('/list', authAdmin, allOrders)
orderRouter.post('/status', authAdmin, updateStatus)

// User Payment features
orderRouter.post('/place', authenticateUser, placeOrder) //COD & BCA
orderRouter.post('/stripe', authenticateUser, placeOrderStripe) //stripe

// User features
orderRouter.post('/orders', authenticateUser, userOrders)

export default orderRouter