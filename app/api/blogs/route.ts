import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  parsePagination,
  paginatedResponse,
  badRequest,
  serverError,
  unauthorized,
} from "@/lib/api-helpers";

// GET /api/blogs?page=1&limit=9&search=next
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { page, limit, search, skip } = parsePagination(req.nextUrl);

    const where = {
      isPublished: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
          { author: { name: { contains: search, mode: "insensitive" as const } } },
        ],
      }),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { likes: true } },
          likes: user
            ? { where: { userId: user.id }, select: { id: true } }
            : false,
        },
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json(
      paginatedResponse(
        blogs.map((b) => ({
          id: b.id,
          title: b.title,
          content: b.content,
          isPublished: b.isPublished,
          authorId: b.authorId,
          authorName: b.author.name,
          likesCount: b._count.likes,
          liked: Array.isArray(b.likes) ? b.likes.length > 0 : false,
          createdAt: b.createdAt,
        })),
        total,
        { page, limit, search, skip }
      )
    );
  } catch (err) {
    return serverError(err);
  }
}

// POST /api/blogs
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const isPublished = Boolean(body.isPublished);

    if (!title || !content) return badRequest("Title and content are required");

    const blog = await prisma.blog.create({
      data: { title, content, isPublished, authorId: user.id },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { likes: true } },
      },
    });

    return NextResponse.json(
      {
        id: blog.id,
        title: blog.title,
        content: blog.content,
        isPublished: blog.isPublished,
        authorId: blog.authorId,
        authorName: blog.author.name,
        likesCount: blog._count.likes,
        liked: false,
        createdAt: blog.createdAt,
      },
      { status: 201 }
    );
  } catch (err) {
    return serverError(err);
  }
}