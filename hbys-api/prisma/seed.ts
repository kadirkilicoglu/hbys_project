// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // --- Klinikler ---
  const dahiliye = await prisma.clinic.upsert({
    where: { code: "INT" },
    update: {},
    create: { id: "clinic-int", name: "Dahiliye", code: "INT" },
  });

  const kbb = await prisma.clinic.upsert({
    where: { code: "ENT" },
    update: {},
    create: { id: "clinic-ent", name: "Kulak Burun Boğaz", code: "ENT" },
  });

  const kard = await prisma.clinic.upsert({
    where: { code: "CARD" },
    update: {},
    create: { id: "clinic-card", name: "Kardiyoloji", code: "CARD" },
  });

  // --- Doktorlar ---
  const dInt1 = await prisma.doctor.upsert({
    where: { id: "doc-int-1" },
    update: {},
    create: {
      id: "doc-int-1",
      name: "Uzm. Dr. Ayşe Yılmaz",
      specialty: "Dahiliye",
      clinicId: dahiliye.id,
    },
  });

  const dCard1 = await prisma.doctor.upsert({
    where: { id: "doc-card-1" },
    update: {},
    create: {
      id: "doc-card-1",
      name: "Doç. Dr. Okan Eren",
      specialty: "Kardiyoloji",
      clinicId: kard.id,
    },
  });

  const dEnt1 = await prisma.doctor.upsert({
    where: { id: "doc-ent-1" },
    update: {},
    create: {
      id: "doc-ent-1",
      name: "Op. Dr. Derya Şen",
      specialty: "KBB",
      clinicId: kbb.id,
    },
  });

  // --- Hasta (TCKN = id) ---
  const hasta1 = await prisma.patient.upsert({
    where: { id: "12345678901" }, // TCKN primary key
    update: {},
    create: {
      id: "12345678901",
      adSoyad: "Deneme Hasta",
      dogum: new Date("1990-01-01"),
      cinsiyet: "KADIN",
    },
  });

  // --- Randevular (idempotent) ---
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // 00:00

  await prisma.appointment.upsert({
    where: { id: "seed-appt-1" },
    update: {},
    create: {
      id: "seed-appt-1",
      randevuTarih: dayStart,
      randevuSaat: "09:00",
      durum: "BEKLIYOR",
      note: "İlk muayene",
      patientId: hasta1.id, // doğrudan TCKN
      doctorId: dInt1.id,
      clinicId: dahiliye.id,
    },
  });

  await prisma.appointment.upsert({
    where: { id: "seed-appt-2" },
    update: {},
    create: {
      id: "seed-appt-2",
      randevuTarih: dayStart,
      randevuSaat: "10:00",
      durum: "BEKLIYOR",
      note: "KBB kontrol",
      patientId: hasta1.id,
      doctorId: dEnt1.id,
      clinicId: kbb.id,
    },
  });
}

main()
  .then(() => console.log("Seed tamam"))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
