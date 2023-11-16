-- CreateTable
CREATE TABLE "columns" (
    "column_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "column_name" VARCHAR(100) NOT NULL,
    "column_order" DECIMAL NOT NULL DEFAULT 1.0,
    "user_id" UUID,

    CONSTRAINT "columns_pkey" PRIMARY KEY ("column_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "refresh_token" TEXT NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("refresh_token")
);

-- CreateTable
CREATE TABLE "todos" (
    "todo_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "column_id" UUID NOT NULL,
    "todo_value" TEXT NOT NULL,
    "todo_completed" BOOLEAN NOT NULL,
    "todo_order" DECIMAL NOT NULL DEFAULT 1.0,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("todo_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_name" VARCHAR(100) NOT NULL,
    "user_email" VARCHAR(100) NOT NULL,
    "user_password" TEXT NOT NULL,
    "user_phone" VARCHAR(50) NOT NULL,
    "user_age" INTEGER NOT NULL,
    "user_gender" VARCHAR(10) NOT NULL,
    "user_site" VARCHAR(250) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "boards" (
    "board_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "board_name" VARCHAR(100) NOT NULL,
    "user_id" UUID,

    CONSTRAINT "boards_pkey" PRIMARY KEY ("board_id")
);

-- CreateTable
CREATE TABLE "friendship" (
    "friendship_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "friend_id" UUID NOT NULL,
    "board_id" UUID NOT NULL,

    CONSTRAINT "friendship_pkey" PRIMARY KEY ("friendship_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_user_email_key" ON "users"("user_email");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_column_id_fkey" FOREIGN KEY ("column_id") REFERENCES "columns"("column_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "boards" ADD CONSTRAINT "fk_cols_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("board_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
