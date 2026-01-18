import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

export interface AuthMiddlewareRequest extends Request {
    userId?: string;
}

export const authMiddleware = async (req: AuthMiddlewareRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
          return res.status(401).json({ error: 'No token provided' });
        }
    
        const decoded = jwt.verify(token, JWT_SECRET) as  { userId: string };
        req.userId = decoded.userId;
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
      }
}