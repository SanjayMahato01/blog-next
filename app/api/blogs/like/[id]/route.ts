import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound, unauthorized, serverError } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

// POST /api/blogs/like/:id  → toggles like/unlike
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id: blogId } = await params;

    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) return notFound("Blog not found");

    const existing = await prisma.like.findUnique({
      where: { userId_blogId: { userId: user.id, blogId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { userId: user.id, blogId } });
    }

    const likesCount = await prisma.like.count({ where: { blogId } });

    return NextResponse.json({
      liked: !existing,
      likesCount,
    });
  } catch (err) {
    return serverError(err);
  }
}