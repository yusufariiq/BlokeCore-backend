import userModel from "../models/userModel.js";

export const getCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);

        if(!user){
            return res.status(404).json({error: 'User not found'});
        }

        res.status(200).json({
            cart: user.cart || {}
        });
    } catch (error) {
        console.error('Get Cart Error:', error);
        res.status(500).json({ error: 'Failed to retrieve cart' });
    }
}

export const updateCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { cart } = req.body;

        const user = await userModel.findByIdAndUpdate(
            userId, 
            { cart }, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ 
            message: 'Cart updated successfully',
            cart: user.cart
        });
    } catch (error) {
        console.error('Update Cart Error:', error);
        res.status(500).json({ error: 'Failed to update cart' });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await userModel.findByIdAndUpdate(
            userId, 
            { cart: {} }, 
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ 
            message: 'Cart cleared successfully',
            cart: {}
        });
    } catch (error) {
        console.error('Clear Cart Error:', error);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};