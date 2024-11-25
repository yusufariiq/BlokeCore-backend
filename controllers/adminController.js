import jwt from 'jsonwebtoken';

const loginAdmin = async (req, res) => {
    try {
        const {email, password} = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success: true, token})
        } else {
            res.json({success: false, message:'Invalid credentials'})
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
}

export { loginAdmin }