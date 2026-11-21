"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import {
  CreateBlogDialog,
  type BlogFormValues,
} from "@/components/CreateBlogModal";
import { BlogTabs } from "@/components/BlogTabs";
import { BlogList } from "@/components/BlogList";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/useDebounce";
import {
  useGetPublishedBlogsQuery,
  useGetMyBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useToggleLikeMutation,
} from "@/lib/api/blogApi";
import type { Blog } from "@/types/blog";
import { useGetMeQuery } from "@/lib/api/authApiSlice";

const PAGE_SIZE = 9;

export default function HomePage() {
  const { data: user } = useGetMeQuery();

  const [tab, setTab] = useState<"published" | "mine">("published");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 300);

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null); // ← NEW

  const publishedQuery = useGetPublishedBlogsQuery(
    { page, limit: PAGE_SIZE, search },
    { skip: tab !== "published" }
  );
  const mineQuery = useGetMyBlogsQuery(
    { page, limit: PAGE_SIZE, search },
    { skip: tab !== "mine" || !user }
  );

  const active = tab === "published" ? publishedQuery : mineQuery;

  const [createBlog, { isLoading: creating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();
  const [deleteBlog] = useDeleteBlogMutation();
  const [toggleLike] = useToggleLikeMutation();

  const handleTabChange = (next: "published" | "mine") => {
    setTab(next);
    setPage(1);
  };

  const handleSearch = (v: string) => {
    setSearchInput(v);
    setPage(1);
  };

  const handleCreate = async (values: BlogFormValues) => {
    try {
      await createBlog(values).unwrap();
      setCreateOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async (values: BlogFormValues) => {
    if (!editing) return;
    try {
      await updateBlog({ id: editing.id, ...values }).unwrap();
      setEditing(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    try {
      await deleteBlog(id).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleLike = (id: string) => {
    if (!user) return;
    toggleLike(id);
  };

  // ← NEW: publish/unpublish handler
  const handleTogglePublish = async (blog: Blog) => {
    setTogglingId(blog.id);
    try {
      await updateBlog({
        id: blog.id,
        isPublished: !blog.isPublished,
      }).unwrap();
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <BlogTabs active={tab} onChange={handleTabChange} />

        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Blogs</h1>
            <p className="mt-1 text-muted-foreground">
              Discover published articles or manage your own.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search blogs..."
                className="w-56 rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {user && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" />
                Create Blog
              </Button>
            )}
          </div>
        </div>

        <BlogList
          blogs={active.data?.data ?? []}
          isLoading={active.isLoading}
          isFetching={active.isFetching}
          error={active.error}
          emptyTitle={
            tab === "published"
              ? search
                ? "No results"
                : "No published blogs"
              : search
              ? "No matching blogs"
              : "You haven't written anything"
          }
          emptyDescription={
            tab === "published"
              ? search
                ? `Nothing matched "${search}".`
                : "Check back later for new articles."
              : search
              ? `Nothing matched "${search}".`
              : "Click 'Create Blog' above to get started."
          }
          showActions={tab === "mine"}
          onDelete={handleDelete}
          onEdit={(b) => setEditing(b)}
          onToggleLike={handleToggleLike}
          onTogglePublish={handleTogglePublish}        // ← NEW
          togglingPublishId={togglingId}               // ← NEW
        />

        {active.data?.pagination && (
          <Pagination
            pagination={active.data.pagination}
            onPageChange={setPage}
            disabled={active.isFetching}
          />
        )}
      </main>

      <CreateBlogDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        submitting={creating}
        onSubmit={handleCreate}
      />

      <CreateBlogDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={
          editing
            ? {
                title: editing.title,
                content: editing.content,
                isPublished: editing.isPublished,
              }
            : null
        }
        submitting={updating}
        onSubmit={handleUpdate}
      />
    </div>
  );
}