import { PrismaClient, Role, ProductCategory, ListingType, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create a dummy vendor account to own these products
  const vendor = await prisma.user.upsert({
    where: { email: 'vendor@ecohub.vn' },
    update: {},
    create: {
      email: 'vendor@ecohub.vn',
      passwordHash: 'hashed_password_placeholder',
      name: 'Eco Gear Store',
      role: Role.VENDOR,
      isVerified: true,
      trustScore: 4.9,
    },
  });

  // 2. Define the 15 requested items
  const items = [
    {
      name: 'Bộ Bát Đĩa Bã Mía Eco (100 cái)',
      description: 'Bộ bát đĩa 100% bã mía, phân hủy sinh học hoàn toàn.',
      category: ProductCategory.TABLEWARE,
      listingType: ListingType.SALE,
      price: 180000,
      status: ProductStatus.ON_SALE,
      ecoFeatures: '100% Phân hủy sinh học',
      imageUrl: 'https://images.unsplash.com/photo-1584984277717-d2ce0c598007?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Cốc Giấy Tái Chế 300ml (50 cái)',
      description: 'Cốc giấy làm từ 100% giấy tái chế, thân thiện môi trường.',
      category: ProductCategory.TABLEWARE,
      listingType: ListingType.SALE,
      price: 75000,
      ecoFeatures: 'Tái chế',
      status: ProductStatus.BEST_SELLER,
      imageUrl: 'https://images.unsplash.com/photo-1584984277717-d2ce0c598007?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Khung Check-in Gỗ Tái Chế Event',
      description: 'Khung check-in lớn dành cho sự kiện, làm từ gỗ tái chế.',
      category: ProductCategory.DECORATION,
      listingType: ListingType.RENT,
      rentalPricePerDay: 150000,
      depositAmount: 300000,
      ecoFeatures: 'Tái chế, Tái sử dụng',
      status: ProductStatus.NEW_ARRIVAL,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bộ Loa Kéo Dã Ngoại & 2 Mic',
      description: 'Loa kéo âm thanh lớn cho sự kiện ngoài trời.',
      category: ProductCategory.EQUIPMENT,
      listingType: ListingType.RENT,
      rentalPricePerDay: 250000,
      depositAmount: 1000000,
      ecoFeatures: 'Tái sử dụng',
      status: ProductStatus.BEST_SELLER,
      imageUrl: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Máy Chiếu HD & Màn Chiếu 100 inch',
      description: 'Máy chiếu độ nét cao kèm màn chiếu 100 inch.',
      category: ProductCategory.EQUIPMENT,
      listingType: ListingType.RENT,
      rentalPricePerDay: 350000,
      depositAmount: 1500000,
      ecoFeatures: 'Tái sử dụng',
      status: ProductStatus.BEST_SELLER,
      imageUrl: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Đèn LED Dây Dùng Pin Sạc (10m)',
      description: 'Đèn LED dây trang trí, tiết kiệm điện, dùng pin sạc.',
      category: ProductCategory.DECORATION,
      listingType: ListingType.SALE,
      price: 120000,
      status: ProductStatus.ON_SALE,
      ecoFeatures: 'Tiết kiệm năng lượng, Tái sử dụng',
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Áo Cử Nhân / Lễ Phục Tốt Nghiệp',
      description: 'Áo cử nhân chất liệu vải thoáng mát.',
      category: ProductCategory.ATTIRE,
      listingType: ListingType.RENT,
      rentalPricePerDay: 80000,
      depositAmount: 200000,
      status: ProductStatus.FREE_BORROW,
      ecoFeatures: 'Tái sử dụng',
      imageUrl: 'https://images.unsplash.com/photo-1563214532-628d011116c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bộ Cổng Chào Lụa & Hoa Tươi Eco',
      description: 'Cổng chào sang trọng thân thiện môi trường.',
      category: ProductCategory.DECORATION,
      listingType: ListingType.RENT,
      rentalPricePerDay: 500000,
      depositAmount: 1000000,
      ecoFeatures: 'Vật liệu tự nhiên, Tái sử dụng',
      status: ProductStatus.NEW_ARRIVAL,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Thiệp Mời Hạt Giống Nảy Mầm (Pack 20)',
      description: 'Thiệp mời làm từ giấy chứa hạt giống, có thể trồng xuống đất.',
      category: ProductCategory.DECORATION,
      listingType: ListingType.SALE,
      price: 150000,
      ecoFeatures: '100% Phân hủy sinh học, Không rác thải',
      status: ProductStatus.NEW_ARRIVAL,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Thùng Rác Phân Loại Rác Sự Kiện (Set 3)',
      description: 'Set 3 thùng rác phân loại (Hữu cơ, Tái chế, Khác).',
      category: ProductCategory.EQUIPMENT,
      listingType: ListingType.RENT,
      rentalPricePerDay: 100000,
      depositAmount: 200000,
      ecoFeatures: 'Khuyến khích tái chế, Tái sử dụng',
      status: ProductStatus.BEST_SELLER,
      imageUrl: 'https://images.unsplash.com/photo-1516724562728-afc824a36e84?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bộ Bàn Ghế Tái Chế Pallet (Set 1 bàn 4 ghế)',
      description: 'Bàn ghế làm từ gỗ pallet tái chế.',
      category: ProductCategory.DECORATION,
      listingType: ListingType.RENT,
      rentalPricePerDay: 200000,
      depositAmount: 500000,
      ecoFeatures: 'Tái chế, Gỗ thân thiện',
      status: ProductStatus.NEW_ARRIVAL,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bình Nước Thủy Tinh 5L Có Vòi Rót',
      description: 'Bình thủy tinh dung tích lớn dùng cho tiệc buffet.',
      category: ProductCategory.TABLEWARE,
      listingType: ListingType.SALE,
      price: 220000,
      status: ProductStatus.ON_SALE,
      ecoFeatures: 'Tái sử dụng nhiều lần, Giảm rác thải nhựa',
      imageUrl: 'https://images.unsplash.com/photo-1584984277717-d2ce0c598007?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Standee Khung Gỗ Tự Nhiên A3/A4',
      description: 'Standee khung gỗ tự nhiên sang trọng.',
      category: ProductCategory.DECORATION,
      listingType: ListingType.RENT,
      rentalPricePerDay: 50000,
      depositAmount: 100000,
      ecoFeatures: 'Gỗ tái sử dụng',
      status: ProductStatus.BEST_SELLER,
      imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Ống Hút Cỏ Sậy Hữu Cơ (Hộp 500 ống)',
      description: 'Ống hút tự nhiên từ cỏ sậy, an toàn và dễ phân hủy.',
      category: ProductCategory.TABLEWARE,
      listingType: ListingType.SALE,
      price: 250000,
      ecoFeatures: '100% Phân hủy sinh học, Vật liệu hữu cơ',
      status: ProductStatus.BEST_SELLER,
      imageUrl: 'https://images.unsplash.com/photo-1584984277717-d2ce0c598007?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bộ Dụng Cụ Đo Đạc / Thiết Kế Gian Hàng',
      description: 'Dụng cụ cần thiết để setup gian hàng sự kiện.',
      category: ProductCategory.PROJECT_TOOLS,
      listingType: ListingType.RENT,
      rentalPricePerDay: 70000,
      depositAmount: 300000,
      status: ProductStatus.FREE_BORROW,
      ecoFeatures: 'Tái sử dụng, Dùng chung',
      imageUrl: 'https://images.unsplash.com/photo-1563214532-628d011116c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    },
  ];

  for (const item of items) {
    await prisma.product.create({
      data: {
        ...item,
        ownerId: vendor.id,
      }
    });
  }

  console.log('Seeded 15 eco-gear products successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
