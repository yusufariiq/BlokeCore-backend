import express from 'express';
import authenticateUser from '../middleware/authUser.js';
import {
    getCart,
    updateCart,
    clearCart,
} from '../controllers/cartController.js'

const cartRouter = express.Router();

cartRouter.get('/', authenticateUser, getCart);
cartRouter.post('/', authenticateUser, updateCart);
cartRouter.delete('/', authenticateUser, clearCart);

export default cartRouter;