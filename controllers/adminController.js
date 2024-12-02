import jwt from 'jsonwebtoken';

const loginAdmin = async (req, res) => {
    try {
        const {email, password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(
                { 
                    email: email, 
                    isAdmin: true 
                }, 
                process.env.JWT_SECRET, 
                { expiresIn: '24h' }
            );
            res.json({
                success: true, 
                token,
                message: 'Admin login successful'
            });
        } else {
            res.status(401).json({
                success: false, 
                message: 'Invalid credentials'
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

export { loginAdmin }