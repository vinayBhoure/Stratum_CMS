import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/apiError";
import { generateId } from "../utils/nanoId";
import { signToken } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { SignupInput, LoginInput } from "../validators/auth.schema";

export interface AuthUser {
  userId: string;
  name: string;
  role: Role;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export interface SessionUser extends AuthUser {
  emailVerified: boolean;
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const existing = await prisma.auth.findUnique({
    where: { email: input.email },
    select: { userId: true },
  });
  if (existing) {
    throw new ApiError(409, "EMAIL_EXISTS", "An account with this email already exists");
  }

  const password = await hashPassword(input.password);
  const userId = generateId();

  // Auth and UserInformation are 1-to-1 and must always coexist.
  await prisma.$transaction(async (tx) => {
    await tx.auth.create({
      data: { userId, email: input.email, password, name: input.name },
    });
    await tx.userInformation.create({
      data: { userId, name: input.name },
    });
  });

  const token = signToken({ userId, role: Role.user });
  return { user: { userId, name: input.name, role: Role.user }, token };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const auth = await prisma.auth.findUnique({
    where: { email: input.email },
    select: { userId: true, name: true, role: true, password: true },
  });

  // Do not distinguish "no such user" from "wrong password" — prevents email enumeration.
  if (!auth || !(await verifyPassword(input.password, auth.password))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const token = signToken({ userId: auth.userId, role: auth.role });
  return { user: { userId: auth.userId, name: auth.name, role: auth.role }, token };
}

export async function logout(token: string): Promise<void> {
  // Idempotent — re-blacklisting an already-revoked token is a no-op.
  await prisma.tokenBlacklist.createMany({ data: [{ token }], skipDuplicates: true });
}

export async function deleteAccount(userId: string, token: string, password: string): Promise<void> {
  const auth = await prisma.auth.findUnique({
    where: { userId },
    select: { password: true },
  });
  if (!auth || !(await verifyPassword(password, auth.password))) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid password");
  }

  // Blacklist the still-valid cookie token, then hard-delete the user.
  // Auth deletion cascades to all content rows per schema onDelete: Cascade.
  await prisma.$transaction(async (tx) => {
    await tx.tokenBlacklist.createMany({ data: [{ token }], skipDuplicates: true });
    await tx.auth.delete({ where: { userId } });
  });
}

export async function getSession(userId: string): Promise<SessionUser> {
  const auth = await prisma.auth.findUnique({
    where: { userId },
    select: { userId: true, name: true, role: true, emailVerified: true },
  });
  if (!auth) {
    throw new ApiError(401, "UNAUTHENTICATED", "Not authenticated");
  }
  return auth;
}
