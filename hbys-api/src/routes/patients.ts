import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

/** Yaratma: TCKN(11) + AdSoyad zorunlu, dogum/cinsiyet opsiyonel */
const createSchema = z.object({
  tckn: z
    .string()
    .regex(/^\d{11}$/, "TCKN 11 haneli olmalı")
    .optional(),
  id: z
    .string()
    .regex(/^\d{11}$/, "TCKN 11 haneli olmalı")
    .optional(),
  adSoyad: z.string().min(3, "Ad Soyad en az 3 karakter"),
  dogum: z.string().optional(), // "YYYY-MM-DD"
  cinsiyet: z.enum(["KADIN", "ERKEK", "DIGER"]).optional(),
});

const updateSchema = z.object({
  adSoyad: z.string().min(3).optional(),
  dogum: z.string().optional(),
  cinsiyet: z.enum(["KADIN", "ERKEK", "DIGER"]).optional(),
});

// Liste
router.get("/", async (_req, res) => {
  const list = await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      adSoyad: true,
      dogum: true,
      cinsiyet: true,
      createdAt: true,
    },
  });
  res.json(list);
});

// Basit arama (?tckn=...)
router.get("/search", async (req, res) => {
  const tckn = String(req.query.tckn ?? "");
  if (!/^\d{11}$/.test(tckn)) return res.json([]);
  const p = await prisma.patient.findUnique({ where: { id: tckn } });
  res.json(p ? [p] : []);
});

// Tek kayıt
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const p = await prisma.patient.findUnique({
    where: { id },
    include: { randevular: true },
  });
  if (!p) return res.status(404).json({ error: "Hasta bulunamadı" });
  res.json(p);
});

// Oluştur (PK = TCKN)
router.post("/", async (req, res) => {
  try {
    const body = createSchema.parse(req.body);

    const tckn = body.tckn ?? body.id;
    if (!tckn) return res.status(400).json({ error: "TCKN zorunludur" });

    // dogum/cinsiyet opsiyonel → varsayılan ver
    const dogumDate = body.dogum
      ? new Date(body.dogum)
      : new Date("1900-01-01");
    const cins = body.cinsiyet ?? "DIGER";

    const created = await prisma.patient.create({
      data: {
        id: tckn, // 🔑 PK = TCKN
        adSoyad: body.adSoyad,
        dogum: dogumDate,
        cinsiyet: cins,
      },
      select: {
        id: true,
        adSoyad: true,
        dogum: true,
        cinsiyet: true,
        createdAt: true,
      },
    });
    res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === "P2002") {
      return res.status(409).json({ error: "Bu TCKN ile hasta zaten kayıtlı" });
    }
    return res
      .status(400)
      .json({ error: "Geçersiz istek", details: String(e) });
  }
});

// Güncelle
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const body = updateSchema.parse(req.body);
    const updated = await prisma.patient.update({
      where: { id },
      data: {
        adSoyad: body.adSoyad ?? undefined,
        dogum: body.dogum ? new Date(body.dogum) : undefined,
        cinsiyet: body.cinsiyet ?? undefined,
      },
      select: {
        id: true,
        adSoyad: true,
        dogum: true,
        cinsiyet: true,
        createdAt: true,
      },
    });
    res.json(updated);
  } catch (e: any) {
    if (e?.code === "P2025")
      return res.status(404).json({ error: "Hasta bulunamadı" });
    res.status(400).json({ error: "Güncelleme hatası", details: String(e) });
  }
});

// Sil
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.patient.delete({ where: { id } });
    res.json({ ok: true });
  } catch (e: any) {
    if (e?.code === "P2025")
      return res.status(404).json({ error: "Hasta bulunamadı" });
    res.status(400).json({ error: "Silme hatası", details: String(e) });
  }
});

export default router;
