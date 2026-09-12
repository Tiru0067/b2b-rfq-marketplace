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
      email: 'buyer1@merzado.com',
      password: defaultPassword,
      role: 'BUYER',
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      name: 'Rohan Mehta (Apex Retail)',
      email: 'buyer2@merzado.com',
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

  // 3. Create Sample RFQs
  const inDays = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

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
      productName: 'Industrial Safety Helmets',
      description: 'Standard ISI-approved safety helmets in yellow and white colors for warehouse crew.',
      quantity: 500,
      deliveryLocation: 'Chennai, Tamil Nadu',
      deadline: inDays(25),
      status: 'OPEN',
      buyerId: buyer2.id,
    },
  });

  const rfq4 = await prisma.rfq.create({
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

  // 4. Create Sample Quotations against RFQs
  // Quote 1 for Chairs by Supplier 1
  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier1.id,
      price: 450000,
      deliveryDays: 10,
      notes: 'Can deliver in 10 days. Includes 3-year warranty and free doorstep assembly.',
    },
  });

  // Quote 2 for Chairs by Supplier 2
  await prisma.quotation.create({
    data: {
      rfqId: rfq1.id,
      supplierId: supplier2.id,
      price: 420000,
      deliveryDays: 15,
      notes: 'Direct factory pricing. Delivery within two weeks with all hardware included.',
    },
  });

  // Quote for Backpacks by Supplier 1
  await prisma.quotation.create({
    data: {
      rfqId: rfq2.id,
      supplierId: supplier1.id,
      price: 210000,
      deliveryDays: 7,
      notes: 'Waterproof fabric with custom embroidered logo included at no extra cost.',
    },
  });

  // Quote for Safety Helmets by Supplier 2
  await prisma.quotation.create({
    data: {
      rfqId: rfq3.id,
      supplierId: supplier2.id,
      price: 135000,
      deliveryDays: 12,
      notes: 'Certified ISI grade 1 helmets in individual protective boxes.',
    },
  });

  console.log('Seed data successfully loaded!');
  console.log('--- Test Accounts ---');
  console.log('Buyer:    buyer1@merzado.com (password: password123)');
  console.log('Buyer:    buyer2@merzado.com (password: password123)');
  console.log('Supplier: supplier1@acme.com (password: password123)');
  console.log('Supplier: supplier2@zenith.com (password: password123)');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
