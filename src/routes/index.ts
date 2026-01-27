import { Router } from 'express';
import publicRoutes from './publicRoutes';
import registrationRoutes from './registrationRoutes';
import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';

const router = Router();

router.use('/', publicRoutes);
router.use('/', registrationRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);

export default router;
