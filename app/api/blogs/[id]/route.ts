import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  badRequest,
  notFound,
  unauthorized,
  serverError,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };


export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const blog = await prisma.blog.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { likes: true } },
        likes: user
          ? { where: { userId: user.id }, select: { id: true } }
          : false,
      },
    });

    if (!blog) return notFound("Blog not found");

    return NextResponse.json({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      isPublished: blog.isPublished,
      authorId: blog.authorId,
      authorName: blog.author.name,
      likesCount: blog._count.likes,
      liked: Array.isArray(blog.likes) && blog.likes.length > 0,
      createdAt: blog.createdAt,
    });
  } catch (err) {
    return serverError(err);
  }
}

// PATCH /api/blogs/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) return notFound("Blog not found");
    if (existing.authorId !== user.id) return unauthorized();

    const body = await req.json();
    const data: { title?: string; content?: string; isPublished?: boolean } = {};

    if (typeof body.title === "string") {
      const t = body.title.trim();
      if (!t) return badRequest("Title cannot be empty");
      data.title = t;
    }
    if (typeof body.content === "string") {
      const c = body.content.trim();
      if (!c) return badRequest("Content cannot be empty");
      data.content = c;
    }
    if (typeof body.isPublished === "boolean") data.isPublished = body.isPublished;

    if (Object.keys(data).length === 0) return badRequest("No fields to update");

    const updated = await prisma.blog.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { likes: true } },
        likes: { where: { userId: user.id }, select: { id: true } },
      },
    });

    return NextResponse.json({
      id: updated.id,
      title: updated.title,
      content: updated.content,
      isPublished: updated.isPublished,
      authorId: updated.authorId,
      authorName: updated.author.name,
      likesCount: updated._count.likes,
      liked: Array.isArray(updated.likes) ? updated.likes.length > 0 : false,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    return serverError(err);
  }
}

// DELETE /api/blogs/:id
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) return notFound("Blog not found");
    if (existing.authorId !== user.id) return unauthorized();

    await prisma.blog.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return serverError(err);
  }
}