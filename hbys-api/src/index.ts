import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

import patientsRouter from "./routes/patients";
import appointmentsRouter from "./routes/appointments";

// (İstersen ayrı router yap: clinics & doctors)
import { Router } from "express";

const prisma = new PrismaClient();
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173"], // Vite frontend
    credentials: false,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Basit clinics & doctors router (listeleme)
const meta = Router();

meta.get("/clinics", async (_req, res) => {
  const list = await prisma.clinic.findMany({
    orderBy: { name: "asc" },
  });
  res.json(list);
});

meta.get("/doctors", async (req, res) => {
  const { clinicId } = req.query as { clinicId?: string };
  const where: any = {};
  if (clinicId) where.clinicId = clinicId;
  const list = await prisma.doctor.findMany({
    where,
    orderBy: { name: "asc" },
    include: { clinic: true },
  });
  res.json(list);
});

app.get("/", (_req, res) => {
  res.send(
    "HBYS API çalışıyor. Sağlık: /health | Hastalar: /api/patients | Randevular: /api/appointments"
  );
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api", meta);
app.use("/api/patients", patientsRouter);
app.use("/api/appointments", appointmentsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
