import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

const BCRYPT_COST = 12;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Same generic message a login failure would give — don't leak whether
    // an email is registered.
    return NextResponse.json(
      { error: "Could not create account with those details" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  return NextResponse.json({ ok: true });
}
