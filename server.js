import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import productRouter from './routes/productRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import orderRouter from './routes/orderRoutes.js'
import statsRouter from './routes/statsRoutes.js'
import chartRouter from './routes/chartRoutes.js'
import paymentRouter from './routes/paymentRoutes.js'
import cartRouter from './routes/cartRoutes.js'
import contactRouter from './routes/contactRoutes.js'

// App config
const app = express()
const port = process.env.PORT || 5000
connectDB()

// Middleware
app.use(express.json())
app.use(cors({
    origin: ['https://bloke-core-frontend.vercel.app, https://bloke-core-admin.vercel.app, http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
connectCloudinary()

// API endpoints
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter);
app.use('/api/order', orderRouter);

app.use('/api/stats', statsRouter);
app.use('/api/chart-data', chartRouter);

app.use('/api/payment', paymentRouter);

app.use('/api/cart', cartRouter);

app.use('/api/contact', contactRouter);

app.get('/', (req, res) => {
    res.send("API Working");
})

app.listen(port, () => console.log("Server started on PORT: " + port));