import { Router } from 'express';
import {
  createRfq,
  getAvailableRfqs,
  getRfqDetails,
  updateRfq,
  updateRfqStatus,
  awardQuotation,
} from '../controllers/rfqController.js';
import { submitQuotation } from '../controllers/quotationController.js';
import { authenticate, requireRole } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validate.js';
import {
  createRfqSchema,
  updateRfqSchema,
  updateRfqStatusSchema,
} from '../validations/rfqValidation.js';
import { createQuotationSchema } from '../validations/quotationValidation.js';

const router = Router();

// --- Public / Supplier RFQ Discovery ---
// Browse and search all open RFQs
router.get('/', getAvailableRfqs);

// Get complete details of a single RFQ
router.get('/:id', getRfqDetails);

// --- Buyer Actions ---
// Create a new RFQ (Buyer only)
router.post(
  '/',
  authenticate,
  requireRole('BUYER'),
  validateBody(createRfqSchema),
  createRfq
);

// Edit an existing RFQ (Buyer only)
router.put(
  '/:id',
  authenticate,
  requireRole('BUYER'),
  validateBody(updateRfqSchema),
  updateRfq
);

// Change RFQ status to OPEN or CLOSED (Buyer only)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('BUYER'),
  validateBody(updateRfqStatusSchema),
  updateRfqStatus
);

// Award RFQ to a specific quotation (Buyer only)
router.patch(
  '/:id/award/:quoteId',
  authenticate,
  requireRole('BUYER'),
  awardQuotation
);

// --- Supplier Actions ---
// Submit quotation against an open RFQ (Supplier only)
router.post(
  '/:id/quotations',
  authenticate,
  requireRole('SUPPLIER'),
  validateBody(createQuotationSchema),
  submitQuotation
);

export default router;
