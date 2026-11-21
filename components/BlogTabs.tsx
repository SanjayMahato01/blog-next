"use client";

import { cn } from "@/lib/utils";

interface Props {
  active: "published" | "mine";
  onChange: (tab: "published" | "mine") => void;
}

export function BlogTabs({ active, onChange }: Props) {
  const tabs = [
    { key: "published", label: "All Published" },
    { key: "mine", label: "My Blogs" },
  ] as const;

  const activeIndex = tabs.findIndex((t) => t.key === active);

  return (
    <div className="mb-6 flex justify-center">
      <div className="relative flex rounded-full border border-slate-200/80 bg-slate-100/70 p-1.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        {/* sliding pill */}
        <span
          className="pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-300 ease-out dark:bg-white/20 dark:ring-0 dark:shadow-sm"
          style={{
            width: `calc((100% - 0.75rem) / ${tabs.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative z-10 w-40 rounded-full px-10 py-3 text-sm font-medium transition-colors duration-200",
              active === tab.key
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}