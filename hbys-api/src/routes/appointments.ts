import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

const DURUM = ["BEKLIYOR", "MUAYENEDE", "TAMAMLANDI", "IPTAL"] as const;

const createSchema = z.object({
  patientId: z.string().regex(/^\d{11}$/, "TCKN 11 haneli olmalı"),
  doctorId: z.string().min(1),
  clinicId: z.string().min(1),
  randevuTarih: z.string().min(1), // "YYYY-MM-DD" veya ISO
  randevuSaat: z.string().regex(/^\d{2}:\d{2}$/),
  durum: z.enum(DURUM).default("BEKLIYOR"),
  note: z.string().optional(),
});

// Listele (filtreler: date, clinicId?, doctorId?, status?)
router.get("/", async (req, res) => {
  const { doctorId, clinicId, status, date } = req.query as {
    doctorId?: string;
    clinicId?: string;
    status?: string;
    date?: string;
  };

  const where: any = {};
  if (doctorId) where.doctorId = doctorId;
  if (clinicId) where.clinicId = clinicId;

  if (status && DURUM.includes(status.toUpperCase() as any)) {
    where.durum = status.toUpperCase();
  }

  if (date) {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    where.randevuTarih = { gte: start, lt: end };
  }

  const list = await prisma.appointment.findMany({
    where,
    orderBy: [{ randevuTarih: "desc" }, { randevuSaat: "desc" }],
    include: { patient: true, doctor: true, clinic: true },
  });

  res.json(list);
});

// Oluştur
router.post("/", async (req, res) => {
  try {
    const parsed = createSchema.parse(req.body);
    const day = new Date(parsed.randevuTarih);
    const created = await prisma.appointment.create({
      data: {
        randevuTarih: new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate()
        ),
        randevuSaat: parsed.randevuSaat,
        durum: parsed.durum,
        note: parsed.note,
        patientId: parsed.patientId, // TCKN
        doctorId: parsed.doctorId,
        clinicId: parsed.clinicId,
      },
    });
    res.status(201).json(created);
  } catch (e: any) {
    if (e.code === "P2002" && e.meta?.target?.includes("unique_doctor_slot")) {
      return res.status(409).json({
        error: "Randevu çakışması",
        details: "Bu hekim için aynı tarih ve saatte randevu var.",
      });
    }
    if (e.code === "P2003") {
      return res.status(400).json({
        error: "Bağlı kayıt bulunamadı",
        details: "Hasta/klinik/doktor geçerli mi kontrol edin.",
      });
    }
    res.status(400).json({ error: "Geçersiz istek", details: String(e) });
  }
});

// Durum güncelle
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const body = z.object({ durum: z.enum(DURUM) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Geçersiz durum" });

  try {
    const updated = await prisma.appointment.update({
      where: { id },
      data: { durum: body.data.durum },
    });
    res.json(updated);
  } catch (e: any) {
    if (e.code === "P2025")
      return res.status(404).json({ error: "Randevu bulunamadı" });
    res.status(400).json({ error: "Güncelleme hatası", details: String(e) });
  }
});

// Tüm alanları güncelle
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const parsed = createSchema.parse(req.body);
    const day = new Date(parsed.randevuTarih);
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        randevuTarih: new Date(
          day.getFullYear(),
          day.getMonth(),
          day.getDate()
        ),
        randevuSaat: parsed.randevuSaat,
        durum: parsed.durum,
        note: parsed.note,
        patientId: parsed.patientId,
        doctorId: parsed.doctorId,
        clinicId: parsed.clinicId,
      },
    });
    res.json(updated);
  } catch (e: any) {
    if (e.code === "P2002" && e.meta?.target?.includes("unique_doctor_slot")) {
      return res.status(409).json({
        error: "Randevu çakışması",
        details: "Bu hekim için aynı tarih ve saatte randevu var.",
      });
    }
    if (e.code === "P2025")
      return res.status(404).json({ error: "Randevu bulunamadı" });
    res.status(400).json({ error: "Güncelleme hatası", details: String(e) });
  }
});

// Sil
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.appointment.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    if (e.code === "P2025")
      return res.status(404).json({ error: "Randevu bulunamadı" });
    res.status(400).json({ error: "Silme hatası", details: String(e) });
  }
});

export default router;
