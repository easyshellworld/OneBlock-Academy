-- CreateTable
CREATE TABLE "registrations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_name" TEXT NOT NULL,
    "wechat_id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age_group" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "university" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "has_web3_experience" BOOLEAN NOT NULL,
    "study_time" TEXT NOT NULL,
    "interests" TEXT NOT NULL,
    "platforms" TEXT NOT NULL,
    "willing_to_hackathon" BOOLEAN NOT NULL,
    "willing_to_lead" BOOLEAN NOT NULL,
    "wants_private_service" BOOLEAN NOT NULL,
    "referrer" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "approved" BOOLEAN DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "task1_choice_score" INTEGER NOT NULL DEFAULT 0,
    "task1_practice_score" INTEGER NOT NULL DEFAULT 0,
    "task2_choice_score" INTEGER NOT NULL DEFAULT 0,
    "task2_practice_score" INTEGER NOT NULL DEFAULT 0,
    "task3_choice_score" INTEGER NOT NULL DEFAULT 0,
    "task3_practice_score" INTEGER NOT NULL DEFAULT 0,
    "task4_choice_score" INTEGER NOT NULL DEFAULT 0,
    "task4_practice_score" INTEGER NOT NULL DEFAULT 0,
    "task5_choice_score" INTEGER NOT NULL DEFAULT 0,
    "task5_practice_score" INTEGER NOT NULL DEFAULT 0,
    "task6_choice_score" INTEGER NOT NULL DEFAULT 0,
    "task6_practice_score" INTEGER NOT NULL DEFAULT 0,
    "task1_choice_completed" BOOLEAN NOT NULL DEFAULT false,
    "task2_choice_completed" BOOLEAN NOT NULL DEFAULT false,
    "task3_choice_completed" BOOLEAN NOT NULL DEFAULT false,
    "task4_choice_completed" BOOLEAN NOT NULL DEFAULT false,
    "task5_choice_completed" BOOLEAN NOT NULL DEFAULT false,
    "task6_choice_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "tasks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "registrations" ("student_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "task_scores" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" TEXT NOT NULL,
    "task_number" INTEGER NOT NULL,
    "score_type" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "task_scores_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "registrations" ("student_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "choice_questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "task_number" INTEGER NOT NULL,
    "question_number" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "correct_option" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "course_contents" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "task_number" INTEGER,
    "content_markdown" TEXT NOT NULL,
    "is_pinned" BOOLEAN DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "student_notes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" TEXT NOT NULL,
    "student_name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_markdown" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "student_notes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "registrations" ("student_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "staff" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "wechat_id" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "approved" BOOLEAN DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "project_id" TEXT NOT NULL,
    "project_name" TEXT,
    "factory_address" TEXT,
    "whitelist_address" TEXT,
    "nft_address" TEXT,
    "claim_address" TEXT,
    "erc20_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME
);

-- CreateTable
CREATE TABLE "student_project_claims" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "project_name" TEXT NOT NULL,
    "nft_address" TEXT NOT NULL,
    "claim_address" TEXT NOT NULL,
    "erc20_address" TEXT NOT NULL,
    "has_claimed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME,
    CONSTRAINT "student_project_claims_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "registrations" ("student_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_project_claims_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project" ("project_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "registrations_student_id_key" ON "registrations"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_wechat_id_key" ON "staff"("wechat_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_wallet_address_key" ON "staff"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "project_project_id_key" ON "project"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_project_claims_student_id_project_id_key" ON "student_project_claims"("student_id", "project_id");
