/**
 * Database seed script for MyNaga Gabay API
 * Seeds facilities, doctors, and sample availability slots
 */

import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.syncOutboxEvent.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.facility.deleteMany();

  // ============================================================================
  // Seed Facilities - Real Naga City health facilities with coordinates
  // ============================================================================

  const facilities = await Promise.all([
    prisma.facility.create({
      data: {
        name: 'Bicol Medical Center',
        type: 'hospital',
        address: 'Concepcion Grande, Naga City',
        barangay: 'Concepcion Grande',
        city: 'Naga City',
        phone: '(054) 472-3456',
        hours: '24/7',
        services: ['Emergency', 'Surgery', 'OB-Gyne', 'Pediatrics', 'Internal Medicine', 'Cardiology', 'Pulmonology'],
        latitude: 13.6218,
        longitude: 123.1948,
        isActive: true,
      },
    }),
    prisma.facility.create({
      data: {
        // Note: The old "Naga City Hospital" has been replaced/relocated as Naga City General Hospital (NCGH) in Balatas.
        name: 'Naga City General Hospital',
        type: 'hospital',
        address: 'Access Road, Balatas, Naga City',
        barangay: 'Balatas',
        city: 'Naga City',
        phone: '(054) 811-1234',
        hours: '24/7',
        services: ['Emergency', 'General Medicine', 'Pediatrics', 'OB-Gyne'],
        latitude: 13.6272003,
        longitude: 123.2082876,
        photoUrl: '/facilities/ncgh.jpg',
        isActive: true,
      },
    }),
    prisma.facility.create({
      data: {
        name: 'Mother Seton Hospital',
        type: 'hospital',
        address: 'Diversion Road, Naga City',
        barangay: 'Triangulo',
        city: 'Naga City',
        phone: '(054) 473-9999',
        hours: '24/7',
        services: ['Emergency', 'Surgery', 'OB-Gyne', 'Pediatrics', 'Internal Medicine'],
        latitude: 13.6312,
        longitude: 123.1845,
        isActive: true,
      },
    }),
    prisma.facility.create({
      data: {
        name: 'San Francisco District Health Center',
        type: 'health_center',
        address: 'Barangay San Francisco, Naga City',
        barangay: 'San Francisco',
        city: 'Naga City',
        phone: '(054) 472-1111',
        hours: '8:00 AM - 5:00 PM (Mon-Fri)',
        services: ['Primary Care', 'Immunization', 'Prenatal', 'Family Planning', 'TB DOTS'],
        latitude: 13.6190,
        longitude: 123.1820,
        isActive: true,
      },
    }),
    prisma.facility.create({
      data: {
        name: 'Abella Health Center',
        type: 'health_center',
        address: 'Barangay Abella, Naga City',
        barangay: 'Abella',
        city: 'Naga City',
        phone: '(054) 472-2222',
        hours: '8:00 AM - 5:00 PM (Mon-Fri)',
        services: ['Primary Care', 'Immunization', 'Prenatal', 'Family Planning'],
        latitude: 13.6275,
        longitude: 123.1915,
        isActive: true,
      },
    }),
    prisma.facility.create({
      data: {
        name: 'Mercury Drug - SM City Naga',
        type: 'pharmacy',
        address: 'SM City Naga, CBD II, Naga City',
        barangay: 'Triangulo',
        city: 'Naga City',
        phone: '(054) 473-5678',
        hours: '10:00 AM - 9:00 PM',
        services: ['Prescription Medicines', 'OTC Medicines', 'Medical Supplies'],
        latitude: 13.6295,
        longitude: 123.1835,
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${facilities.length} facilities`);

  // ============================================================================
  // Seed Doctors
  // ============================================================================

  const doctors = await Promise.all([
    // Bicol Medical Center doctors
    prisma.doctor.create({
      data: {
        name: 'Dr. Maria Santos',
        specialization: 'Internal Medicine',
        facilityId: facilities[0].id,
        consultationFee: 500,
        isActive: true,
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Jose Reyes',
        specialization: 'Pulmonology',
        facilityId: facilities[0].id,
        consultationFee: 800,
        isActive: true,
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Ana Cruz',
        specialization: 'Pediatrics',
        facilityId: facilities[0].id,
        consultationFee: 600,
        isActive: true,
      },
    }),
    // Naga City Hospital doctors
    prisma.doctor.create({
      data: {
        name: 'Dr. Pedro Gonzales',
        specialization: 'General Medicine',
        facilityId: facilities[1].id,
        consultationFee: 400,
        isActive: true,
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Lorna Villanueva',
        specialization: 'OB-Gyne',
        facilityId: facilities[1].id,
        consultationFee: 700,
        isActive: true,
      },
    }),
    // Mother Seton Hospital
    prisma.doctor.create({
      data: {
        name: 'Dr. Carlos Mendoza',
        specialization: 'Internal Medicine',
        facilityId: facilities[2].id,
        consultationFee: 550,
        isActive: true,
      },
    }),
    // Health Center doctors
    prisma.doctor.create({
      data: {
        name: 'Dr. Elena Bautista',
        specialization: 'General Practice',
        facilityId: facilities[3].id,
        consultationFee: 0, // Free at health center
        isActive: true,
      },
    }),
  ]);

  console.log(`Created ${doctors.length} doctors`);

  // ============================================================================
  // Seed Availability Slots - Next 7 days, 9 AM - 5 PM, 30-min slots
  // ============================================================================

  const slots: { doctorId: string; startTime: Date; endTime: Date }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const doctor of doctors) {
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);

      // Skip weekends for health center doctors
      const dayOfWeek = date.getDay();
      if (doctor.facilityId === facilities[3].id && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }

      // Create slots from 9 AM to 5 PM (30-minute slots)
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = new Date(date);
          startTime.setHours(hour, minute, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + 30);

          slots.push({
            doctorId: doctor.id,
            startTime,
            endTime,
          });
        }
      }
    }
  }

  await prisma.availabilitySlot.createMany({
    data: slots,
  });

  console.log(`Created ${slots.length} availability slots`);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
