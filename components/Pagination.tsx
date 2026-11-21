"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Pagination as P } from "@/types/blog";

interface Props {
  pagination: P;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ pagination, onPageChange, disabled }: Props) {
  const { page, totalPages, hasNext, hasPrev, total } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t pt-5">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total} total
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev || disabled}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext || disabled}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}