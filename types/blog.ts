export interface Blog {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  authorId: string;
  authorName: string;
  likesCount: number;
  createdAt: string;
  liked?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateBlogInput {
  title: string;
  content: string;
  isPublished: boolean;
}

export interface UpdateBlogInput {
  id: string;
  title?: string;
  content?: string;
  isPublished?: boolean;
}

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Paginated<T> {
  data: T[];
  pagination: Pagination;
}

export interface BlogListParams {
  page?: number;
  limit?: number;
  search?: string;
}