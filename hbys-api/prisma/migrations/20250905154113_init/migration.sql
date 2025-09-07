-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tckn" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "dogum" DATETIME NOT NULL,
    "cinsiyet" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "clinic" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "randevuTarih" DATETIME NOT NULL,
    "randevuSaat" TEXT NOT NULL,
    "durum" TEXT NOT NULL,
    "note" TEXT,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Patient_tckn_key" ON "Patient"("tckn");
