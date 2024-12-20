import express from 'express';
import { 
    loginUser,
    signupUser,
    updateProfile,
    googleAuth,
    forgotPassword,
    resetPassword,
    verifyEmail,
} from '../controllers/userController.js';
import authenticateUser from '../middleware/authUser.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', signupUser);

router.patch('/profile', authenticateUser , updateProfile);
router.post('/auth/google', googleAuth); 

router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.get('/verify-email', verifyEmail);

export default router;