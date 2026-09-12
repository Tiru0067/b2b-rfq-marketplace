import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// Helper function to create a JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_secret_for_dev',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register a new user (as BUYER or SUPPLIER)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if an account already exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Hash the password so it is safely stored
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the new user record in the database
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // Create session token
    const token = generateToken(user.id, user.role);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

// Log in an existing user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Look for user with this email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if the password matches the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Create session token
    const token = generateToken(user.id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get the current logged-in user profile
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};
