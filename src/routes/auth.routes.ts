import { Router } from "express";
import { loginController, getUserController, signUpController, logoutController, refreshTokenController } from "../controllers/auth/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post('/signup', signUpController);
router.post('/login', loginController);
router.get('/me', authMiddleware, getUserController);
router.post('/logout', authMiddleware, logoutController);
router.post('/refresh', refreshTokenController);
export default router;  