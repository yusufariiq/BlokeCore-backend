import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoutes.js'
import productRouter from './routes/productRoutes.js'
import adminRouter from './routes/adminRoutes.js'

// App config
const app = express()
const port = process.env.PORT || 5000
connectDB()

// Middleware
app.use(express.json())
app.use(cors())
connectCloudinary()

// API endpoints
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/product', productRouter)

app.get('/', (req, res) => {
    res.send("API Working");
})

app.listen(port, () => console.log("Server started on PORT: " + port));