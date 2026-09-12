import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

// Check if user has sent a valid login token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Make sure Authorization header is present and starts with Bearer
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Please log in to access this resource',
      });
    }

    // Extract the token after 'Bearer '
    const token = authHeader.split(' ')[1];

    // Verify token with our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');

    // Look up the user in our database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists',
      });
    }

    // Attach user info to the request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token',
    });
  }
};

// Check if logged-in user has the required role (BUYER or SUPPLIER)
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
