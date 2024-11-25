import express from 'express';
import { loginUser, signupUser, updateProfile } from '../controllers/userController.js';
import authenticateUser from '../middleware/authUser.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', signupUser);

router.patch('/profile', authenticateUser , updateProfile);

export default router;