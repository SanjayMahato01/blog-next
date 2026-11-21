import { NextResponse } from "next/server";

export interface PaginationParams {
  page: number;
  limit: number;
  search: string;
  skip: number;
}

export function parsePagination(url: URL): PaginationParams {
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, parseInt(url.searchParams.get("limit") ?? "9", 10) || 9)
  );
  const search = (url.searchParams.get("search") ?? "").trim();
  return { page, limit, search, skip: (page - 1) * limit };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  { page, limit }: PaginationParams
) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(msg = "Not found") {
  return NextResponse.json({ error: msg }, { status: 404 });
}

export function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export function serverError(err: unknown) {
  console.error(err);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}