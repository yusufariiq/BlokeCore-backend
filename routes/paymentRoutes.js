import express from 'express'
import { midtransCallback } from '../controllers/paymentController.js'

const paymentRouter  = express.Router()

// Midrans callback
paymentRouter.get('/payment-callback', midtransCallback);

export default paymentRouter;
