"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { FullscreenToggle } from "@/components/FullscreenToggle";
import { authApiSlice, useLogoutMutation } from "@/lib/api/authApiSlice";
import type { User } from "@/types/blog";
import { useDispatch } from "react-redux";
import { blogApi } from "@/lib/api/blogApi";

interface Props {
  user?: User | null;
}

export function Navbar({ user }: Props) {
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();
  const dispatch = useDispatch();
  const handleLogout = async () => {
  await logout().unwrap();
  
  // wipe every cached query/mutation result
  dispatch(blogApi.util.resetApiState());
  dispatch(authApiSlice.util.resetApiState());

  router.push("/login");
  router.refresh();
};
  return (
    <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <a href="/" className="text-xl font-bold">
          Blog<span className="text-primary">App</span>
        </a>

        <div className="flex items-center gap-1">
          <FullscreenToggle />
          <ModeToggle />

          {user ? (
            <>
              <span className="hidden px-2 text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>Logging out…</>
                ) : (
                  <>
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Logout
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => router.push("/login")}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}