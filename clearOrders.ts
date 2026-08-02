import { prisma } from './lib/prisma';

async function main() {
  console.log("Deleting all BookingOrders...")
  
  await prisma.orderItem.deleteMany({})
  await prisma.bookingOrder.deleteMany({})

  console.log("All mock orders deleted successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
