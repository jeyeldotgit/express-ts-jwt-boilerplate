import { Router } from 'express';
import { exampleController, testPrismaController } from '../controllers/exampleController';

const router = Router();

// Example route
router.get('/', exampleController.getExample);
router.get('/prisma', testPrismaController);
export default router;

