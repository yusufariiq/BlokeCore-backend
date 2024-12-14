import express from 'express'
import {
    placeOrder,
    allOrders,
    userOrders,
    updateStatus,
    placeOrderMidtrans,
    getOrderDetails,
} from '../controllers/orderController.js'
import authenticateUser from '../middleware/authUser.js'
import authenticateAdmin from '../middleware/authAdmin.js'

const orderRouter = express.Router()

orderRouter.post('/list', authenticateAdmin, allOrders)
orderRouter.post('/status', authenticateAdmin, updateStatus)

orderRouter.post('/place', authenticateUser, placeOrder) //COD
orderRouter.post('/midtrans', authenticateUser, placeOrderMidtrans) //midtrans

orderRouter.post('/user-orders', authenticateUser, userOrders)

orderRouter.get('/details/:orderId', authenticateUser, getOrderDetails)

export default orderRouter