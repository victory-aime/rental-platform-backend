import {
  PrismaClient,
  EtablissementType,
  Plan,
  SubscriptionStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Nettoyage
  await prisma.bookingCar.deleteMany();
  await prisma.bookingRoom.deleteMany();
  await prisma.car.deleteMany();
  await prisma.room.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.carAgency.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.etablissement.deleteMany();
  await prisma.user.deleteMany();

  // Création des utilisateurs
  const userHotel = await prisma.user.create({
    data: {
      email: 'hotel@example.com',
      name: 'Hotel User',
    },
  });

  const userCar = await prisma.user.create({
    data: {
      email: 'car@example.com',
      name: 'Car User',
    },
  });

  // Création d’un établissement hôtelier et son hôtel
  const hotelEtablissement = await prisma.etablissement.create({
    data: {
      name: 'Hotel de Luxe',
      type: EtablissementType.HOTEL,
      address: 'Place Pampidou',
      city: 'Paris',
      country: 'France',
      description: 'Un hôtel 5 étoiles à Paris',
      phone: '+33 1 23 45 67 89',
      owner: {
        connect: { id: userHotel.id },
      },
      hotel: {
        create: {},
      },
    },
  });

  // Création d’un établissement agence et sa voiture
  const agenceEtablissement = await prisma.etablissement.create({
    data: {
      name: 'Agence AutoLux',
      type: EtablissementType.AGENCE,
      address: 'Rue de Rivoli',
      city: 'Paris',
      country: 'France',
      description: 'Agence de location de voitures haut de gamme',
      phone: '+33 6 12 34 56 78',
      owner: {
        connect: { id: userCar.id },
      },
      agence: {
        create: {
          cars: {
            create: {
              name: 'Tesla Model S',
              brand: 'Tesla',
              model: 'Model S',
              plateNumber: '1578 NASAS',
              dailyPrice: 120.0,
            },
          },
        },
      },
    },
  });

  // Mise à jour des users pour lier leur établissement (si pas fait via owner)
  await prisma.user.update({
    where: { id: userHotel.id },
    data: {
      etablissementId: hotelEtablissement.id,
    },
  });

  await prisma.user.update({
    where: { id: userCar.id },
    data: {
      etablissementId: agenceEtablissement.id,
    },
  });

  // Création des plans d’abonnement
  const hotelPlan = await prisma.subscriptionPlan.create({
    data: {
      name: Plan.BASIC,
      price: 29.99,
      duration: 30,
      maxListings: 10,
      maxImagesPerListing: 5,
      maxReservationsPerMonth: 100,
    },
  });

  const carPlan = await prisma.subscriptionPlan.create({
    data: {
      name: Plan.PRO,
      price: 59.99,
      duration: 30,
      maxListings: 30,
      maxImagesPerListing: 8,
      maxReservationsPerMonth: 300,
      canUseDiscounts: true,
      canAccessAnalytics: true,
      prioritySupport: true,
    },
  });

  // Création des abonnements liés aux établissements
  await prisma.subscription.create({
    data: {
      etablissementId: hotelEtablissement.id,
      planId: hotelPlan.id,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: SubscriptionStatus.ACTIVE,
    },
  });

  await prisma.subscription.create({
    data: {
      etablissementId: agenceEtablissement.id,
      planId: carPlan.id,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: SubscriptionStatus.ACTIVE,
    },
  });

  console.log('✅ Seed executed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
