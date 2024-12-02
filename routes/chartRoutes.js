import express from 'express'

const chartRouter = express.Router();

chartRouter.get('/', async (req, res) => {
  try {
    const chartData = [
      { month: 'Jan', sales: 4000 },
      { month: 'Feb', sales: 3000 },
      { month: 'Mar', sales: 5000 },
      { month: 'Apr', sales: 4500 },
      { month: 'May', sales: 6000 },
      { month: 'Jun', sales: 5500 },
    ];
    res.json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chart data' });
  }
});

export default chartRouter
