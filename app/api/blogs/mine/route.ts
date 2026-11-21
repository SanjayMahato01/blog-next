import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  parsePagination,
  paginatedResponse,
  unauthorized,
  serverError,
} from "@/lib/api-helpers";

// GET /api/blogs/mine?page=1&limit=9&search=prisma
export async function GET(req: NextRequest) {
  // Read session OUTSIDE try/catch
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const { page, limit, search, skip } = parsePagination(req.nextUrl);

    const where = {
      authorId: user.id,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { content: { contains: search, mode: "insensitive" as const } },
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
          likes: { where: { userId: user.id }, select: { id: true } },
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
          liked: b.likes.length > 0,
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