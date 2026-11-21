"use client";

import { BlogCard } from "./BlogCard";
import { Loader2 } from "lucide-react";
import type { Blog } from "@/types/blog";

interface Props {
  blogs: Blog[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: unknown;
  emptyTitle?: string;
  emptyDescription?: string;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (blog: Blog) => void;
  onToggleLike?: (id: string) => void;
  onTogglePublish?: (blog: Blog) => void;
  togglingPublishId?: string | null;
}

export function BlogList({
  blogs,
  isLoading,
  isFetching,
  error,
  emptyTitle = "No blogs yet",
  emptyDescription = "Be the first to write one!",
  showActions,
  onDelete,
  onEdit,
  onToggleLike,
  onTogglePublish,
  togglingPublishId,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center text-sm text-destructive">
        Failed to load blogs. Please try again.
      </div>
    );
  }

  if (!blogs.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 text-center">
        <h3 className="text-lg font-medium">{emptyTitle}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div
      className={
        "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 " +
        (isFetching ? "opacity-60 transition-opacity" : "")
      }
    >
      {blogs.map((blog) => (
        <BlogCard
          key={blog.id}
          blog={blog}
          showActions={showActions}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleLike={onToggleLike}
          onTogglePublish={onTogglePublish}
          togglingPublish={togglingPublishId === blog.id}
        />
      ))}
    </div>
  );
}