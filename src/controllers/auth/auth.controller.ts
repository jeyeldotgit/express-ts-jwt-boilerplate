import { Request, Response } from "express";
import { signupUser, loginUser, getUser, logoutUser, generateAccessToken } from "../../services/auth/auth-service";
import { AuthMiddlewareRequest } from "../../middlewares/auth.middleware";

interface AuthControllerPayload {
    email: string;
    password: string;
}

interface AuthControllerResponse {
    user: {
        id: string;
        email: string;
    };
    message: string;
}

export const signUpController = async (req: Request, res: Response): Promise<Response<AuthControllerResponse>> => {
    try {
        const { email, password } = req.body as AuthControllerPayload;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await signupUser({ email, password });
        return res.status(200).json({ user: {id: user.user.id, email: user.user.email}, message: "User signed up successfully" });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "User already exists") {
                return res.status(400).json({ message: error.message });
            } 
            if (error.message === "Email and password are required") {
                return res.status(400).json({ message: error.message });
            }
            if (error.message === "Invalid password") {
                return res.status(400).json({ message: error.message });
            }
            if (error.message === "User not found") {
                return res.status(400).json({ message: error.message });
            }
        } 
        return res.status(500).json({ message: "Internal server error" });
    } 
}

export const loginController = async (req: Request, res: Response): Promise<Response<AuthControllerResponse>> => {
    try {

        const { email, password } = req.body as AuthControllerPayload;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await loginUser({ email, password });
        res.cookie("refreshToken", user.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 1000 * 60 * 60 * 24 * 7 });
        return res.status(200).json({ accessToken: user.accessToken, user: {id: user.user.id, email: user.user.email}, message: "User logged in successfully" });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "User not found") {
                return res.status(400).json({ message: error.message });
            }
            if (error.message === "Invalid password") {
                return res.status(400).json({ message: error.message });
            }
            if (error.message === "Email and password are required") {
                return res.status(400).json({ message: error.message });
            }
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const logoutController = async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken as string;
        await logoutUser(refreshToken);
        res.clearCookie("refreshToken");
        return res.status(200).json({ message: "User logged out successfully" });
}

export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken as string;
        
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token not provided" });
        }

        const result = await generateAccessToken(refreshToken);
        return res.status(200).json({ accessToken: result.accessToken, message: "Access token generated successfully" });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Session not found" || error.message === "Invalid refresh token") {
                return res.status(401).json({ message: error.message });
            }
            if (error.message === "Session expired") {
                return res.status(401).json({ message: error.message });
            }
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getUserController = async (req: AuthMiddlewareRequest, res: Response) => {
    try {
        const userId = req.userId as string;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const user = await getUser(userId);
        return res.status(200).json({ user, message: "User found successfully" });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "User not found") {
                return res.status(400).json({ message: error.message });
            }
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}
