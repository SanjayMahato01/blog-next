"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  CreateBlogDialog,
  type BlogFormValues,
} from "@/components/CreateBlogModal";
import { useGetMeQuery } from "@/lib/api/authApiSlice";
import {
  useGetBlogByIdQuery,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useToggleLikeMutation,
} from "@/lib/api/blogApi";
import { cn } from "@/lib/utils";

export default function BlogDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: user } = useGetMeQuery();
  const { data: blog, isLoading, error } = useGetBlogByIdQuery(id, {
  skip: !id,
  refetchOnMountOrArgChange: true,  
});

  const [editing, setEditing] = useState(false);
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [toggleLike] = useToggleLikeMutation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={user} />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Blog not found</h1>
          <p className="mt-2 text-muted-foreground">
            It may have been deleted or you don't have access.
          </p>
          <Link href="/">
            <Button className="mt-6">Back to blogs</Button>
          </Link>
        </main>
      </div>
    );
  }

  const isOwner = !!user && user.id === blog.authorId;

  const handleUpdate = async (values: BlogFormValues) => {
    try {
      await updateBlog({ id: blog.id, ...values }).unwrap();
      setEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this blog?")) return;
    try {
      await deleteBlog(blog.id).unwrap();
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Back link */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <article>
          {/* Status pill */}
          <div className="mb-3 flex items-center justify-between">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                blog.isPublished
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              )}
            >
              {blog.isPublished ? "Published" : "Draft"}
            </span>

            {isOwner && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setEditing(true)}
                  aria-label="Edit"
                  title="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleDelete}
                  aria-label="Delete"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight">
            {blog.title}
          </h1>

          {/* Meta row with eye icon */}
          <div className="mb-8 flex items-center gap-4 border-y py-3 text-sm text-muted-foreground">
            <span>By {blog.authorName}</span>
            <span>·</span>
            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span>·</span>

         

            {/* Like button */}
            <button
              onClick={() => user && toggleLike(blog.id)}
              disabled={!user}
              className={cn(
                "ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition",
                "hover:bg-muted disabled:opacity-50",
                blog.liked && "text-red-500"
              )}
              aria-label={blog.liked ? "Unlike" : "Like"}
            >
              <Heart
                className={cn("h-4 w-4", blog.liked && "fill-current")}
              />
              <span>{blog.likesCount}</span>
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-neutral max-w-none whitespace-pre-wrap text-base leading-7 dark:prose-invert">
            {blog.content}
          </div>
        </article>
      </main>

      {/* Edit dialog */}
      {isOwner && (
        <CreateBlogDialog
          open={editing}
          onOpenChange={setEditing}
          initial={{
            title: blog.title,
            content: blog.content,
            isPublished: blog.isPublished,
          }}
          submitting={updating}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}