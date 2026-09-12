import prisma from '../config/db.js';

// Create a new RFQ (Buyer only)
export const createRfq = async (req, res, next) => {
  try {
    const { productName, description, quantity, deliveryLocation, deadline } = req.body;

    // Save the RFQ connected to the logged-in buyer
    const rfq = await prisma.rfq.create({
      data: {
        productName,
        description,
        quantity,
        deliveryLocation,
        deadline: new Date(deadline),
        buyerId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};

// Get all RFQs created by the logged-in buyer
export const getBuyerRfqs = async (req, res, next) => {
  try {
    const rfqs = await prisma.rfq.findMany({
      where: { buyerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { quotations: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: rfqs,
    });
  } catch (error) {
    next(error);
  }
};

// Get single RFQ with all received supplier quotations (Buyer only)
export const getBuyerRfqDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rfq = await prisma.rfq.findUnique({
      where: { id },
      include: {
        quotations: {
          orderBy: { price: 'asc' }, // Cheapest quotes first
          include: {
            supplier: {
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

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    // Make sure only the buyer who created this RFQ can view its quotations
    if (rfq.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view quotations for this RFQ',
      });
    }

    return res.status(200).json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};

// Edit an existing RFQ (Buyer only)
export const updateRfq = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productName, description, quantity, deliveryLocation, deadline } = req.body;

    const existingRfq = await prisma.rfq.findUnique({
      where: { id },
    });

    if (!existingRfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    // Only creator can edit their RFQ
    if (existingRfq.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own RFQs',
      });
    }

    const updatedRfq = await prisma.rfq.update({
      where: { id },
      data: {
        ...(productName && { productName }),
        ...(description && { description }),
        ...(quantity && { quantity }),
        ...(deliveryLocation && { deliveryLocation }),
        ...(deadline && { deadline: new Date(deadline) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'RFQ updated successfully',
      data: updatedRfq,
    });
  } catch (error) {
    next(error);
  }
};

// Open or close an RFQ (Buyer only)
export const updateRfqStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, deadline } = req.body;

    const existingRfq = await prisma.rfq.findUnique({
      where: { id },
    });

    if (!existingRfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    // Only creator can change status
    if (existingRfq.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only change status for your own RFQs',
      });
    }

    // When reopening, ensure we have a valid future deadline
    let newDeadline = existingRfq.deadline;
    if (status === 'OPEN') {
      if (deadline) {
        const parsedDeadline = new Date(deadline);
        if (isNaN(parsedDeadline.getTime()) || parsedDeadline <= new Date()) {
          return res.status(400).json({
            success: false,
            message: 'New deadline must be a future date and time to reopen this RFQ',
          });
        }
        newDeadline = parsedDeadline;
      } else if (new Date(existingRfq.deadline) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'The current deadline has expired. Please choose a new future deadline to reopen this RFQ.',
          requiresNewDeadline: true,
        });
      }
    }

    const updatedRfq = await prisma.rfq.update({
      where: { id },
      data: {
        status,
        deadline: newDeadline,
      },
    });

    return res.status(200).json({
      success: true,
      message: `RFQ is now marked as ${status}`,
      data: updatedRfq,
    });
  } catch (error) {
    next(error);
  }
};

// Award an RFQ to a specific quotation (Buyer only)
export const awardQuotation = async (req, res, next) => {
  try {
    const { id, quoteId } = req.params;

    const rfq = await prisma.rfq.findUnique({
      where: { id },
      include: { quotations: true },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    // Only creator can award quotations
    if (rfq.buyerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only award quotations for your own RFQs',
      });
    }

    // Make sure the quotation belongs to this RFQ
    const targetQuote = rfq.quotations.find((q) => q.id === quoteId);
    if (!targetQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found on this RFQ',
      });
    }

    // In a single transaction:
    // 1. Mark selected quotation as AWARDED
    // 2. Mark other quotations as NOT_SELECTED
    // 3. Mark RFQ as CLOSED
    await prisma.$transaction([
      prisma.quotation.update({
        where: { id: quoteId },
        data: { status: 'AWARDED' },
      }),
      prisma.quotation.updateMany({
        where: {
          rfqId: id,
          id: { not: quoteId },
        },
        data: { status: 'NOT_SELECTED' },
      }),
      prisma.rfq.update({
        where: { id },
        data: { status: 'CLOSED' },
      }),
    ]);

    // Return the updated RFQ with quotations and suppliers
    const updatedRfq = await prisma.rfq.findUnique({
      where: { id },
      include: {
        quotations: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { price: 'asc' },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Quotation awarded successfully. RFQ is now closed.',
      data: updatedRfq,
    });
  } catch (error) {
    next(error);
  }
};

// Browse all available RFQs with search and filters (Suppliers & public)
export const getAvailableRfqs = async (req, res, next) => {
  try {
    const { search, location, status = 'OPEN' } = req.query;

    const whereClause = {
      ...(status && { status }),
      ...(location && {
        deliveryLocation: {
          contains: location,
          mode: 'insensitive',
        },
      }),
      ...(search && {
        OR: [
          { productName: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const rfqs = await prisma.rfq.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: rfqs,
    });
  } catch (error) {
    next(error);
  }
};

// Get single RFQ details (for suppliers browsing)
export const getRfqDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const rfq = await prisma.rfq.findUnique({
      where: { id },
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { quotations: true },
        },
      },
    });

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};
