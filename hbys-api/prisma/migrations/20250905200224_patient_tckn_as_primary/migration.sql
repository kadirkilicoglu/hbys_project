/*
  Warnings:

  - You are about to drop the column `tckn` on the `Patient` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Appointment_clinicId_randevuTarih_idx";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adSoyad" TEXT NOT NULL,
    "dogum" DATETIME NOT NULL,
    "cinsiyet" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Patient" ("adSoyad", "cinsiyet", "createdAt", "dogum", "id") SELECT "adSoyad", "cinsiyet", "createdAt", "dogum", "id" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_clinicId_idx" ON "Appointment"("clinicId");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_randevuTarih_idx" ON "Appointment"("doctorId", "randevuTarih");
