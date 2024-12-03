import express from 'express'
import orderModel from '../models/orderModel.js';

const chartRouter = express.Router();

chartRouter.get('/', async (req, res) => {
  try {
    const monthlySales = await orderModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: { $toDate: '$date' } },
            year: { $year: { $toDate: '$date' } }
          },
          totalSales: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      },
      {
        $project: {
          _id: 0,
          month: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
                { case: { $eq: ['$_id.month', 2] }, then: 'Feb' },
                { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
                { case: { $eq: ['$_id.month', 4] }, then: 'Apr' },
                { case: { $eq: ['$_id.month', 5] }, then: 'May' },
                { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
                { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
                { case: { $eq: ['$_id.month', 8] }, then: 'Aug' },
                { case: { $eq: ['$_id.month', 9] }, then: 'Sep' },
                { case: { $eq: ['$_id.month', 10] }, then: 'Oct' },
                { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
                { case: { $eq: ['$_id.month', 12] }, then: 'Dec' }
              ],
              default: 'Unknown'
            }
          },
          sales: '$totalSales'
        }
      }
    ]);

    // Ensure all months are represented (even with zero sales)
    const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const completeChartData = allMonths.map(month => {
      const monthData = monthlySales.find(m => m.month === month);
      return {
        month,
        sales: monthData ? monthData.sales : 0
      };
    });

    res.json(completeChartData);
  } catch (error) {
    console.error('Chart data error:', error);
    res.status(500).json({ message: 'Error fetching chart data' });
  }
});

export default chartRouter
