/*
  Warnings:

  - You are about to drop the column `clinic` on the `Doctor` table. All the data in the column will be lost.
  - Added the required column `clinicId` to the `Appointment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clinicId` to the `Doctor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "randevuTarih" DATETIME NOT NULL,
    "randevuSaat" TEXT NOT NULL,
    "durum" TEXT NOT NULL,
    "note" TEXT,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointment" ("doctorId", "durum", "id", "note", "patientId", "randevuSaat", "randevuTarih") SELECT "doctorId", "durum", "id", "note", "patientId", "randevuSaat", "randevuTarih" FROM "Appointment";
DROP TABLE "Appointment";
ALTER TABLE "new_Appointment" RENAME TO "Appointment";
CREATE INDEX "Appointment_clinicId_randevuTarih_idx" ON "Appointment"("clinicId", "randevuTarih");
CREATE UNIQUE INDEX "Appointment_doctorId_randevuTarih_randevuSaat_key" ON "Appointment"("doctorId", "randevuTarih", "randevuSaat");
CREATE TABLE "new_Doctor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    CONSTRAINT "Doctor_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Doctor" ("id", "name", "specialty") SELECT "id", "name", "specialty" FROM "Doctor";
DROP TABLE "Doctor";
ALTER TABLE "new_Doctor" RENAME TO "Doctor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_code_key" ON "Clinic"("code");
