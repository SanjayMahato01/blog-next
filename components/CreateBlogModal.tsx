"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export interface BlogFormValues {
  title: string;
  content: string;
  isPublished: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: BlogFormValues | null;
  submitting?: boolean;
  onSubmit?: (values: BlogFormValues) => void | Promise<void>;
}

const EMPTY: BlogFormValues = { title: "", content: "", isPublished: false };

export function CreateBlogDialog({
  open,
  onOpenChange,
  initial,
  submitting,
  onSubmit,
}: Props) {
  const isEdit = !!initial;
  const [form, setForm] = useState<BlogFormValues>(initial ?? EMPTY);
  const [error, setError] = useState("");

  // sync when opening / switching between create & edit
  useEffect(() => {
    if (open) {
      setForm(initial ?? EMPTY);
      setError("");
    }
  }, [open, initial]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }
    await onSubmit?.({
      title: form.title.trim(),
      content: form.content.trim(),
      isPublished: form.isPublished,
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setForm(initial ?? EMPTY);
      setError("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEdit ? "Edit Blog" : "Create a Blog"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your article and save changes."
              : "Write your article. You can save it as a draft or publish it right away."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter a compelling title"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your blog content here..."
              rows={8}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            Publish immediately
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="-mx-4 -mb-4 mt-2">
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Blog"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}