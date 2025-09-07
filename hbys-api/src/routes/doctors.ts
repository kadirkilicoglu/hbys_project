import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res) => {
  const { clinicId } = req.query;
  const where = clinicId ? { clinicId: String(clinicId) } : {};
  const doctors = await prisma.doctor.findMany({
    where,
    orderBy: { name: "asc" },
    include: { clinic: true },
  });
  res.json(doctors);
});

export default router;
