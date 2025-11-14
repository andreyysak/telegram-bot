-- CreateTable
CREATE TABLE "Fuel" (
    "gas_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "station" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fuel_pkey" PRIMARY KEY ("gas_id")
);

-- AddForeignKey
ALTER TABLE "Fuel" ADD CONSTRAINT "Fuel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
