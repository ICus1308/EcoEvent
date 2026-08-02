import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding default warehouses...');
  
  const w1 = await prisma.warehouse.upsert({
    where: { id: 'wh-hn-01' },
    update: {},
    create: {
      id: 'wh-hn-01',
      name: 'Kho Miền Bắc (Hà Nội)',
      location: 'Quận Cầu Giấy, Hà Nội'
    }
  });

  const w2 = await prisma.warehouse.upsert({
    where: { id: 'wh-hcm-01' },
    update: {},
    create: {
      id: 'wh-hcm-01',
      name: 'Kho Miền Nam (TP. Hồ Chí Minh)',
      location: 'Quận 1, TP. Hồ Chí Minh'
    }
  });

  // Attach warehouse inventories for existing products if any
  const products = await prisma.product.findMany();
  for (const p of products) {
    await prisma.warehouseInventory.upsert({
      where: {
        productId_warehouseId: {
          productId: p.id,
          warehouseId: w1.id
        }
      },
      update: {},
      create: {
        productId: p.id,
        warehouseId: w1.id,
        quantity: Math.max(1, p.stock || 5),
        reservedQty: 0
      }
    });

    await prisma.warehouseInventory.upsert({
      where: {
        productId_warehouseId: {
          productId: p.id,
          warehouseId: w2.id
        }
      },
      update: {},
      create: {
        productId: p.id,
        warehouseId: w2.id,
        quantity: Math.max(1, p.stock || 3),
        reservedQty: 0
      }
    });
  }

  console.log('Warehouses and inventories seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
