import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Limpa a tabela Pricing antes de popular
  await prisma.pricing.deleteMany({});
  console.log('✅ Tabela Pricing limpa');

  // Popula a tabela Pricing
  const pricings = await prisma.pricing.createMany({
    data: [
      { serviceType: 'Lavagem simples', vehicleCategory: 'Hatch', priceCents: 8000 },
      { serviceType: 'Lavagem simples', vehicleCategory: 'Sedan', priceCents: 9000 },
      { serviceType: 'Lavagem simples', vehicleCategory: 'SUV', priceCents: 9500 },
      { serviceType: 'Lavagem simples', vehicleCategory: 'Caminhonete', priceCents: 12000 },
      { serviceType: 'Lavagem completa', vehicleCategory: 'Hatch', priceCents: 10000 },
      { serviceType: 'Lavagem completa', vehicleCategory: 'Sedan', priceCents: 11000 },
      { serviceType: 'Lavagem completa', vehicleCategory: 'SUV', priceCents: 11500 },
      { serviceType: 'Lavagem completa', vehicleCategory: 'Caminhonete', priceCents: 15000 },
    ],
  });

  console.log(`✅ ${pricings.count} preços cadastrados`);
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });