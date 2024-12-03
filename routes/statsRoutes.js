import express from 'express'
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js'

const statsRouter = express.Router();

statsRouter.get('/', async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();

    const totalOrders = await orderModel.countDocuments();

    const totalRevenue = await orderModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount'} } }
    ]);

    const currentDate = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
    const previousMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).getTime();

    const currentMonthOrders = await orderModel.countDocuments({
      date: {
        $gte: currentMonthStart,
        $lt: currentMonthStart + 30 * 24 * 60 * 60 * 1000
      }
    });

    const previousMonthOrders = await orderModel.countDocuments({
      date: { 
        $gte: previousMonthStart, 
        $lt: currentMonthStart 
      }
    });

    const growth = previousMonthOrders > 0 ? ((currentMonthOrders - previousMonthOrders) / previousMonthOrders * 100).toFixed(1) : 0;

    res.json({
      users: totalUsers,
      orders: totalOrders,
      revenue: totalRevenue[0]?.total || 0,
      growth: parseFloat(growth)
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

export default statsRouter