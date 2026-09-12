import { Router } from 'express';
import { getBuyerRfqs, getBuyerRfqDetails } from '../controllers/rfqController.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Protect all routes here: must be logged in as a BUYER
router.use(authenticate, requireRole('BUYER'));

// Get all RFQs posted by the logged-in buyer
router.get('/rfqs', getBuyerRfqs);

// Get single RFQ with all received supplier quotations
router.get('/rfqs/:id', getBuyerRfqDetails);

export default router;
