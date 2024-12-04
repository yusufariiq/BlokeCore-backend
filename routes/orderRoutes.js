import express from 'express'
import {
    placeOrder,
    allOrders,
    userOrders,
    updateStatus,
    placeOrderMidtrans,
} from '../controllers/orderController.js'
import authenticateUser from '../middleware/authUser.js'
import authenticateAdmin from '../middleware/authAdmin.js'

const orderRouter = express.Router()

// Admin features
orderRouter.post('/list', authenticateAdmin, allOrders)
orderRouter.post('/status', authenticateAdmin, updateStatus)

// User Payment features
orderRouter.post('/place', authenticateUser, placeOrder) //COD & BCA
orderRouter.post('/midtrans', authenticateUser, placeOrderMidtrans) //midtrans

// User features
orderRouter.post('/user-orders', authenticateUser, userOrders)

export default orderRouter