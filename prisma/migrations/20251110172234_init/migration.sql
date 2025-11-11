-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "telegram_name" TEXT,
    "telegram_username" TEXT,
    "telegram_user_id" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Trip" (
    "trip_id" SERIAL NOT NULL,
    "telegram_user_id" TEXT NOT NULL,
    "kilometrs" DOUBLE PRECISION NOT NULL,
    "direction" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trip_pkey" PRIMARY KEY ("trip_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_telegram_user_id_key" ON "User"("telegram_user_id");

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_telegram_user_id_fkey" FOREIGN KEY ("telegram_user_id") REFERENCES "User"("telegram_user_id") ON DELETE CASCADE ON UPDATE CASCADE;
