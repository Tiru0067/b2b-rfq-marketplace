import { Router } from 'express';
import { getSupplierQuotations } from '../controllers/quotationController.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect all routes here: must be logged in as a SUPPLIER
router.use(authenticate, requireRole('SUPPLIER'));

// Get all quotations submitted by the logged-in supplier
router.get('/quotations', getSupplierQuotations);

export default router;
