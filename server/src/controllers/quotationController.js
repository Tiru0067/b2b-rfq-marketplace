import prisma from '../config/db.js';

// Submit a quotation for an RFQ (Supplier only)
export const submitQuotation = async (req, res, next) => {
  try {
    const { id: rfqId } = req.params;
    const { price, deliveryDays, notes } = req.body;
    const supplierId = req.user.id;

    // Check if the RFQ exists
    const rfq = await prisma.rfq.findUnique({
      where: { id: rfqId },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    // Check if RFQ is still open
    if (rfq.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'This RFQ is closed and cannot accept new quotations',
      });
    }

    // Check if the RFQ deadline has passed
    if (new Date(rfq.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'The deadline for this RFQ has already passed',
      });
    }

    // Check if the supplier already submitted a quotation for this RFQ
    const existingQuotation = await prisma.quotation.findUnique({
      where: {
        rfqId_supplierId: {
          rfqId,
          supplierId,
        },
      },
    });

    if (existingQuotation) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a quotation for this RFQ',
      });
    }

    // Save the quotation to the database
    const quotation = await prisma.quotation.create({
      data: {
        rfqId,
        supplierId,
        price,
        deliveryDays,
        notes,
      },
      include: {
        rfq: {
          select: {
            productName: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Quotation submitted successfully',
      data: quotation,
    });
  } catch (error) {
    next(error);
  }
};

// Get all quotations submitted by the logged-in supplier
export const getSupplierQuotations = async (req, res, next) => {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { supplierId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        rfq: {
          select: {
            id: true,
            productName: true,
            description: true,
            quantity: true,
            deliveryLocation: true,
            deadline: true,
            status: true,
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: quotations,
    });
  } catch (error) {
    next(error);
  }
};
