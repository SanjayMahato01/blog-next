"use client";

import { useRouter } from "next/navigation";
import { Eye, Heart, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Blog } from "@/types/blog";

interface Props {
  blog: Blog;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (blog: Blog) => void;
  onToggleLike?: (id: string) => void;
  onTogglePublish?: (blog: Blog) => void;
  togglingPublish?: boolean;
}

export function BlogCard({
  blog,
  showActions,
  onDelete,
  onEdit,
  onToggleLike,
  onTogglePublish,
  togglingPublish,
}: Props) {
  const router = useRouter();

  return (
    <article className="group flex w-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
            blog.isPublished
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          )}
        >
          {blog.isPublished ? "Published" : "Draft"}
        </span>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push(`/blog/${blog.id}`)}
            aria-label="View blog"
            title="View blog"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {showActions && onEdit && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(blog)}
              aria-label="Edit"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {showActions && onDelete && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(blog.id)}
              aria-label="Delete"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>

      {/* Title: use block + break-words instead of truncate on a button */}
      <button
        type="button"
        onClick={() => router.push(`/blog/${blog.id}`)}
        className="mb-1 block w-full min-w-0 break-words text-left text-lg font-semibold leading-snug transition-colors hover:text-primary group-hover:text-primary"
      >
        {blog.title}
      </button>

      {/* Content: line-clamp-3 + break-words + overflow-hidden */}
      <p className="mb-4 line-clamp-3 w-full min-w-0 flex-1 break-words overflow-hidden text-sm text-muted-foreground">
        {blog.content}
      </p>

      <div className="flex min-w-0 items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <span className="max-w-full truncate">By {blog.authorName}</span>
          <span className="shrink-0">
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        </div>

        <button
          onClick={() => onToggleLike?.(blog.id)}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-2 py-1 transition",
            "hover:bg-muted",
            blog.liked && "text-red-500"
          )}
          aria-label={blog.liked ? "Unlike" : "Like"}
        >
          <Heart className={cn("h-4 w-4", blog.liked && "fill-current")} />
          <span>{blog.likesCount}</span>
        </button>
      </div>

      {showActions && onTogglePublish && (
        <div className="mt-3 flex min-w-0 items-center justify-between gap-2 border-t pt-3">
          <span className="min-w-0 truncate text-xs font-medium text-muted-foreground">
            {blog.isPublished ? "Visible to everyone" : "Only you can see this"}
          </span>

          <button
            type="button"
            onClick={() => onTogglePublish(blog)}
            disabled={togglingPublish}
            aria-pressed={blog.isPublished}
            aria-label={blog.isPublished ? "Unpublish" : "Publish"}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
              blog.isPublished ? "bg-green-600" : "bg-muted",
              togglingPublish && "opacity-60"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                blog.isPublished ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      )}
    </article>
  );
}