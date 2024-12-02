import express from 'express'

const statsRouter = express.Router();

statsRouter.get('/', async (req, res) => {
  try {
    const stats = {
      users: 100,
      orders: 114,
      revenue: 100500900,
      growth: 12.5
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

export default statsRouter