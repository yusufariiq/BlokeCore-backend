import jwt from "jsonwebtoken"

const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false, 
                message: "Authorization header missing"
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false, 
                message: "Token not provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.isAdmin) {
            return res.status(403).json({
                success: false, 
                message: "Access denied: Admin rights required"
            });
        }

        next()
    } catch (error) {
        console.error('Authentication error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false, 
                message: "Invalid token"
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false, 
                message: "Token expired"
            });
        }

        res.status(500).json({
            success: false,
            message: "Authentication error",
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

export default authenticateAdmin;