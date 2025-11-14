"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>


        <Button
          variant="outline_soft_gradient"
          size="sm"
          className={`flex items-center gap-2 px-0 md:px-0 lg:px-0 rounded-full border border-border overflow-hidden transition-all duration-300 ease-out`}
          aria-label="Toggle navigation"
        >

          <div
            className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-out transform hover:scale-105 bg-gradient-to-br from-primary/20 to-primary/10`}
          >
            {/* {/* Sun icon (Light mode)  */}
            <Sun
              className="absolute h-[1.5rem] w-[1.5rem] text-foreground/90 dark:text-foreground 
                       rotate-0 scale-100 transition-all duration-500 ease-out 
                       dark:-rotate-90 dark:scale-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] z-10 "
            />

            {/* {/* Moon icon (Dark mode)  */}
            <Moon
              className="absolute h-[1.5rem] w-[1.5rem]
                       rotate-90 scale-0 transition-all duration-500 ease-out 
                       dark:rotate-0 dark:scale-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)] z-10 text-foreground"
            />
          </div>


        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="rounded-xl border border-border bg-card/80 backdrop-blur-md shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ${theme === "light"
            ? "bg-primary/20 text-primary font-semibold"
            : "hover:bg-primary/10"
            }`}
        >
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ${theme === "dark"
            ? "bg-primary/20 text-primary font-semibold"
            : "hover:bg-primary/10"
            }`}
        >
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ${theme === "system"
            ? "bg-primary/20 text-primary font-semibold"
            : "hover:bg-primary/10"
            }`}
        >
          <Monitor className="h-5 w-5" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
