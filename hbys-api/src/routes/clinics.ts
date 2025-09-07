import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
  const clinics = await prisma.clinic.findMany({ orderBy: { name: "asc" } });
  res.json(clinics);
});

export default router;
