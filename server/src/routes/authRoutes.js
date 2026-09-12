import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { validateBody } from '../middlewares/validate.js';
import { registerSchema, loginSchema } from '../validations/authValidation.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Route to register a new account
router.post('/register', validateBody(registerSchema), register);

// Route to log into an account
router.post('/login', validateBody(loginSchema), login);

// Route to get current user details from token
router.get('/me', authenticate, getMe);

export default router;
