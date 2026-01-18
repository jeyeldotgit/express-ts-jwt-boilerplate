import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { saveSession, deleteSession } from "../../utils/auth.helpers";


const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if(!JWT_SECRET || !JWT_REFRESH_SECRET) {
    throw new Error("JWT_SECRET or JWT_REFRESH_SECRET is not defined");
}


const ACCESS_TOKEN_EXPIRATION = "15m"; // Short lived token for authentication
const REFRESH_TOKEN_EXPIRATION = "7d"; // Long lived token for refreshing authentication

interface AuthServicePayload {
    email: string;
    password: string;
}


// Signup user
export const signupUser = async (payload: AuthServicePayload) => {
    
    // Validate paylaod
    const { email, password } = payload;

    if (!email || !password) {
        throw new Error("Email and password are required");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({where: {email}});

    if (existingUser) {
        throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({data: {email, password: hashedPassword}});

    return {user: {id: user.id, email: user.email}};
}

// Login user
export const loginUser = async (payload: AuthServicePayload) => {
    const { email, password } = payload;

    // Find User
    const user = await prisma.user.findUnique({where: {email}});

    if (!user) {
        throw new Error("User not found");
    }

    // Verify Password
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        throw new Error("Invalid password"); }

    // Generate JWT
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });

    // Save session to database
    await saveSession(user.id, refreshToken);


    // Return token and refresh token
    return { accessToken: accessToken, refreshToken: refreshToken, user: {id: user.id, email: user.email} };
}

// Logout user by refresh token
export const logoutUser = async (refreshToken: string) => {
    await deleteSession(refreshToken);
}

export const generateAccessToken = async (refreshToken: string) => {
    // Verify refresh token JWT
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    } catch (error) {
        throw new Error("Invalid refresh token");
    }

    // Check if session exists in database
    const session = await prisma.session.findUnique({where: {token: refreshToken}});

    if (!session) {
        throw new Error("Session not found");
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
        throw new Error("Session expired");
    }

    // Generate new access token
    const accessToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });

    // Return access token
    return { accessToken: accessToken };
   
}

export const getUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {id: userId}, 
        select: {id: true, email: true}
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

