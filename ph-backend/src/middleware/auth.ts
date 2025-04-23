import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface TokenPayload {
  id: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    console.log("Auth middleware - Headers:", {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      originHeader: req.headers.origin,
      method: req.method,
      path: req.path
    });

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("Auth failed: No Bearer token in Authorization header");
      return res.status(401).json({ success: false, message: 'No authentication token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log("Auth failed: Token is empty after Bearer prefix");
      return res.status(401).json({ success: false, message: 'No authentication token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-me') as TokenPayload;
    console.log("Token verified, user ID:", decoded.id);

    // Find user by id
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.log("Auth failed: User not found with token user ID:", decoded.id);
      return res.status(401).json({ success: false, message: 'User not found with this token' });
    }

    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Token is not valid',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
  }
};
