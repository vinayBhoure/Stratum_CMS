-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'masterAdmin');

-- CreateTable
CREATE TABLE "auth" (
    "userId" VARCHAR(12) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "token_blacklist" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_information" (
    "userId" VARCHAR(12) NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "contactNumber" JSONB,
    "address" TEXT,
    "googleLocationLink" TEXT,
    "socialMediaLinks" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_information_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" VARCHAR(12) NOT NULL,
    "userId" VARCHAR(12) NOT NULL,
    "skill" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" VARCHAR(12) NOT NULL,
    "userId" VARCHAR(12),
    "name" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" VARCHAR(12) NOT NULL,
    "userId" VARCHAR(12) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mediaUrl" TEXT,
    "githubLink" TEXT,
    "liveLink" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_skills" (
    "projectId" VARCHAR(12) NOT NULL,
    "skillId" VARCHAR(12) NOT NULL,

    CONSTRAINT "project_skills_pkey" PRIMARY KEY ("projectId","skillId")
);

-- CreateTable
CREATE TABLE "project_tags" (
    "projectId" VARCHAR(12) NOT NULL,
    "tagId" VARCHAR(12) NOT NULL,

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("projectId","tagId")
);

-- CreateTable
CREATE TABLE "experience" (
    "id" VARCHAR(12) NOT NULL,
    "userId" VARCHAR(12) NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "durationFrom" TIMESTAMP(3) NOT NULL,
    "durationTo" TIMESTAMP(3),
    "activeJob" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "certificates" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_skills" (
    "experienceId" VARCHAR(12) NOT NULL,
    "skillId" VARCHAR(12) NOT NULL,

    CONSTRAINT "experience_skills_pkey" PRIMARY KEY ("experienceId","skillId")
);

-- CreateTable
CREATE TABLE "resume" (
    "userId" VARCHAR(12) NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_email_key" ON "auth"("email");

-- CreateIndex
CREATE INDEX "auth_email_idx" ON "auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_token_key" ON "token_blacklist"("token");

-- CreateIndex
CREATE INDEX "token_blacklist_createdAt_idx" ON "token_blacklist"("createdAt");

-- CreateIndex
CREATE INDEX "skills_userId_idx" ON "skills"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_userId_skill_key" ON "skills"("userId", "skill");

-- CreateIndex
CREATE INDEX "tags_userId_idx" ON "tags"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_userId_name_key" ON "tags"("userId", "name");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "project_skills_skillId_idx" ON "project_skills"("skillId");

-- CreateIndex
CREATE INDEX "project_tags_tagId_idx" ON "project_tags"("tagId");

-- CreateIndex
CREATE INDEX "experience_userId_idx" ON "experience"("userId");

-- CreateIndex
CREATE INDEX "experience_skills_skillId_idx" ON "experience_skills"("skillId");

-- AddForeignKey
ALTER TABLE "user_information" ADD CONSTRAINT "user_information_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience" ADD CONSTRAINT "experience_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume" ADD CONSTRAINT "resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
