import jwt from "jsonwebtoken"

const authenticateAdmin = async (req, res, next) => {
    try {
        const { token } = req.headers
        if (!token) {
            return res.json({success: false, message: "Not authorized login again"})
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({success: false, message: "Wrong credentials"})
        }

        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
}

export default authenticateAdmin;