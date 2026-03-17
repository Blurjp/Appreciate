-- CreateEnum
CREATE TYPE "gratitude_category" AS ENUM ('FAMILY', 'WORK', 'SMALL_JOYS', 'NATURE', 'HEALTH', 'OTHER');

-- CreateEnum
CREATE TYPE "post_visibility" AS ENUM ('PRIVATE', 'PUBLIC', 'ANONYMOUS');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" VARCHAR(255),
    "name" TEXT NOT NULL,
    "avatar_url" VARCHAR(500),
    "provider" VARCHAR(20) NOT NULL DEFAULT 'email',
    "google_id" TEXT,
    "apple_id" TEXT,
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gratitude_posts" (
    "id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "feeling" VARCHAR(200),
    "category" "gratitude_category" NOT NULL DEFAULT 'OTHER',
    "visibility" "post_visibility" NOT NULL DEFAULT 'PUBLIC',
    "photo_url" VARCHAR(500),
    "author_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "heart_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gratitude_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak_data" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_post_date" DATE,
    "total_posts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "streak_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hearts" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hearts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_email_key" ON "profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_google_id_key" ON "profiles"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_apple_id_key" ON "profiles"("apple_id");

-- CreateIndex
CREATE INDEX "gratitude_posts_author_id_idx" ON "gratitude_posts"("author_id");

-- CreateIndex
CREATE INDEX "gratitude_posts_created_at_idx" ON "gratitude_posts"("created_at" DESC);

-- CreateIndex
CREATE INDEX "gratitude_posts_category_idx" ON "gratitude_posts"("category");

-- CreateIndex
CREATE UNIQUE INDEX "streak_data_user_id_key" ON "streak_data"("user_id");

-- CreateIndex
CREATE INDEX "hearts_post_id_idx" ON "hearts"("post_id");

-- CreateIndex
CREATE INDEX "hearts_user_id_idx" ON "hearts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "hearts_post_id_user_id_key" ON "hearts"("post_id", "user_id");

-- AddForeignKey
ALTER TABLE "gratitude_posts" ADD CONSTRAINT "gratitude_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_data" ADD CONSTRAINT "streak_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hearts" ADD CONSTRAINT "hearts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "gratitude_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hearts" ADD CONSTRAINT "hearts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
