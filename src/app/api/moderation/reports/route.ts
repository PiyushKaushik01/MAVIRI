import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/api-auth";
import { getPrismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requireApiUser();
  if (access.response) return access.response;
  const prisma = getPrismaClient();
  const user = await prisma.user.findUnique({ where: { id: access.user.id }, select: { role: true } });
  if (!user || !["ADMIN", "MODERATOR"].includes(user.role)) return NextResponse.json({ error: "Moderator access is required." }, { status: 403 });
  const reports = await prisma.report.findMany({
    where: { status: "OPEN" }, orderBy: { createdAt: "asc" }, take: 100,
    include: {
      reporter: { select: { name: true, username: true } },
      post: { include: { author: { select: { name: true, username: true } } } },
    },
  });
  return NextResponse.json({ reports });
}
