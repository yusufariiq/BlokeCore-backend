import express from 'express';
import { loginUser, signupUser, loginAdmin } from '../controllers/userController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', signupUser);
router.post('/admin/login', loginAdmin);

export default router;