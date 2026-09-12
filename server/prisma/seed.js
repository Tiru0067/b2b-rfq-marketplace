import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial marketplace data...');

  // Clear existing records to avoid duplicates when reseeding
  await prisma.quotation.deleteMany();
  await prisma.rfq.deleteMany();
  await prisma.user.deleteMany();

  // Hash a common test password for demo accounts
  const salt = await bcrypt.genSalt(10);
  const defaultPassword = await bcrypt.hash('password123', salt);

  // 1. Create Demo Buyers
  const buyer1 = await prisma.user.create({
    data: {
      name: 'Priya Sharma (TechCorp)',
      email: 'buyer1@techcorp.com',
      password: defaultPassword,
      role: 'BUYER',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: 'Rohan Mehta (Apex Retail)',
      email: 'buyer2@apexlogistics.com',
      password: defaultPassword,
      role: 'BUYER',
    },
  });

  // 2. Create Demo Suppliers
  const supplier1 = await prisma.user.create({
    data: {
      name: 'Acme Furnishings & Gear',
      email: 'supplier1@acme.com',
      password: defaultPassword,
      role: 'SUPPLIER',
    },
  });

  const supplier2 = await prisma.user.create({
    data: {
      name: 'Zenith Wholesale Supplies',
      email: 'supplier2@zenith.com',
      password: defaultPassword,
      role: 'SUPPLIER',
    },
  });

  const supplier3 = await prisma.user.create({
    data: {
      name: 'Omni Industrial Solutions',
      email: 'supplier3@omni.com',
      password: defaultPassword,
      role: 'SUPPLIER',
    },
  });

  const supplier4 = await prisma.user.create({
    data: {
      name: 'Prime Logistics & Packaging',
      email: 'supplier4@primepack.com',
      password: defaultPassword,
      role: 'SUPPLIER',
    },
  });

  // Helper for deadline dates
  const inDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // 3. Create Sample RFQs for Buyer 1 (TechCorp)
  const rfq1 = await prisma.rfq.create({
    data: {
      productName: 'Ergonomic Office Chairs',
      description: 'High-back mesh chairs with lumbar support and adjustable armrests for our new tech center.',
      quantity: 100,
      deliveryLocation: 'Bangalore, Karnataka',
      deadline: inDays(20),
      status: 'OPEN',
      buyerId: buyer1.id,
    },
  });

  const rfq2 = await prisma.rfq.create({
    data: {
      productName: 'Heavy-Duty Laptop Backpacks',
      description: 'Water-resistant corporate backpacks with padded 15.6 inch laptop sleeve.',
      quantity: 300,
      deliveryLocation: 'Hyderabad, Telangana',
      deadline: inDays(14),
      status: 'OPEN',
      buyerId: buyer1.id,
    },
  });

  const rfq3 = await prisma.rfq.create({
    data: {
      productName: 'Conference Room 4K Interactive Displays',
      description: '75-inch touch interactive displays with wall mount kits and stylus pens.',
      quantity: 15,
      deliveryLocation: 'Bangalore, Karnataka',
      deadline: inDays(-5),
      status: 'CLOSED',
      buyerId: buyer1.id,
    },
  });

  const rfq4 = await prisma.rfq.create({
    data: {
      productName: 'Commercial HEPA Air Purifiers',
      description: 'Medical-grade HEPA 13 filter air purifiers suitable for large 1000 sq ft office floors.',
      quantity: 50,
      deliveryLocation: 'Mumbai, Maharashtra',
      deadline: inDays(30),
      status: 'OPEN',
      buyerId: buyer1.id,
    },
  });

  // Sample RFQs for Buyer 2 (Apex Retail)
  const rfq5 = await prisma.rfq.create({
    data: {
      productName: 'Industrial Safety Helmets',
      description: 'Standard ISI-approved safety helmets in yellow and white colors for warehouse crew.',
      quantity: 500,
      deliveryLocation: 'Chennai, Tamil Nadu',
      deadline: inDays(25),
      status: 'OPEN',
      buyerId: buyer2.id,
    },
  });

  const rfq6 = await prisma.rfq.create({
    data: {
      productName: '100% Cotton Corporate Polo Shirts',
      description: 'Navy blue breathable polo shirts with company logo stitching on the chest pocket.',
      quantity: 1000,
      deliveryLocation: 'Pune, Maharashtra',
      deadline: inDays(10),
      status: 'OPEN',
      buyerId: buyer2.id,
    },
  });

  const rfq7 = await prisma.rfq.create({
    data: {
      productName: 'Wireless Barcode Scanners & POS Printers',
      description: 'Handheld Bluetooth 2D barcode scanners and 80mm thermal receipt printers.',
      quantity: 80,
      deliveryLocation: 'Delhi NCR',
      deadline: inDays(-10),
      status: 'CLOSED',
      buyerId: buyer2.id,
    },
  });

  // 4. Create Sample Quotations against RFQs
  // --- RFQ 1: Chairs (4 Quotes: Lowest, Fastest, and Middle Standard Bids) ---
  // Lowest price: Zenith (420,000)
  // Fastest delivery: Acme (10 days)
  // Middle standard bids: Omni (465,000, 14 days) and Prime (485,000, 20 days)
  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier1.id,
      price: 450000,
      deliveryDays: 10,
      notes: 'Fastest delivery. Includes 3-year warranty and free doorstep assembly.',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier2.id,
      price: 420000,
      deliveryDays: 18,
      notes: 'Best factory price with all hardware and installation guides included.',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier3.id,
      price: 465000,
      deliveryDays: 14,
      notes: 'Commercial grade build with ergonomic certified mesh and spare wheel casters.',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier4.id,
      price: 485000,
      deliveryDays: 20,
      notes: 'Premium packaging in individual cartons with priority freight shipping.',
    },
  });

  // --- RFQ 2: Backpacks (3 Quotes to show Single Winner & Middle Standard Bids) ---
  await prisma.quotation.create({
    data: {
      rfqId: rfq2.id,
      supplierId: supplier1.id,
      price: 210000,
      deliveryDays: 7,
      notes: 'Waterproof fabric with custom embroidered logo included at no extra cost.',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq2.id,
      supplierId: supplier3.id,
      price: 240000,
      deliveryDays: 12,
      notes: 'Durable nylon 900D with anti-theft zipper compartments.',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq2.id,
      supplierId: supplier4.id,
      price: 255000,
      deliveryDays: 14,
      notes: 'Includes individual dust bags and warranty card for each backpack.',
    },
  });

  // --- RFQ 3: Closed & Awarded RFQ for TechCorp ---
  await prisma.quotation.create({
    data: {
      rfqId: rfq3.id,
      supplierId: supplier1.id,
      price: 740000,
      deliveryDays: 14,
      notes: 'Commercial AV package with universal wall mounts.',
      status: 'NOT_SELECTED',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq3.id,
      supplierId: supplier2.id,
      price: 720000,
      deliveryDays: 15,
      notes: 'Includes heavy duty motorized wall mount brackets.',
      status: 'NOT_SELECTED',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq3.id,
      supplierId: supplier3.id,
      price: 680000,
      deliveryDays: 10,
      notes: 'Direct distributor pricing with 5-year onsite panel warranty.',
      status: 'AWARDED',
    },
  });

  // --- RFQ 5: Safety Helmets (3 Quotes for Buyer 2) ---
  await prisma.quotation.create({
    data: {
      rfqId: rfq5.id,
      supplierId: supplier2.id,
      price: 135000,
      deliveryDays: 14,
      notes: 'Standard middle quote with certified ISI grade 1 helmets.',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq5.id,
      supplierId: supplier3.id,
      price: 120000,
      deliveryDays: 18,
      notes: 'Bulk discounted tier for warehouse supply.',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq5.id,
      supplierId: supplier4.id,
      price: 145000,
      deliveryDays: 8,
      notes: 'Express dispatch from our regional hub.',
    },
  });

  // --- RFQ 6: Polo Shirts ---
  await prisma.quotation.create({
    data: {
      rfqId: rfq6.id,
      supplierId: supplier1.id,
      price: 350000,
      deliveryDays: 14,
      notes: 'Combed cotton 220 GSM with colorfast reactive dyeing.',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq6.id,
      supplierId: supplier4.id,
      price: 375000,
      deliveryDays: 16,
      notes: 'Includes individualized size labeling and packaging.',
    },
  });

  // --- RFQ 7: Closed & Awarded RFQ for Buyer 2 ---
  await prisma.quotation.create({
    data: {
      rfqId: rfq7.id,
      supplierId: supplier1.id,
      price: 295000,
      deliveryDays: 7,
      notes: 'Complete POS combo kit with USB cables and express priority delivery.',
      status: 'AWARDED',
    },
  });

  await prisma.quotation.create({
    data: {
      rfqId: rfq7.id,
      supplierId: supplier2.id,
      price: 310000,
      deliveryDays: 12,
      notes: 'Wholesale batch with 2-year warranty replacement.',
      status: 'NOT_SELECTED',
    },
  });

  console.log('Seed data successfully loaded!');
  console.log('--- Test Accounts ---');
  console.log('Buyer 1:    buyer1@techcorp.com (password: password123)');
  console.log('Buyer 2:    buyer2@apexlogistics.com (password: password123)');
  console.log('Supplier 1: supplier1@acme.com (password: password123)');
  console.log('Supplier 2: supplier2@zenith.com (password: password123)');
  console.log('Supplier 3: supplier3@omni.com (password: password123)');
  console.log('Supplier 4: supplier4@primepack.com (password: password123)');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
