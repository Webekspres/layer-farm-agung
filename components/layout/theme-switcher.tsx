"use client";

import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Terang", icon: Sun },
  { value: "dark", label: "Gelap", icon: Moon },
  { value: "system", label: "Sistem", icon: Monitor },
] as const;

type ThemeValue = (typeof themes)[number]["value"];

function ThemeSwitcherPlaceholder({ className }: { className?: string }) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("relative size-9 shrink-0", className)}
      aria-label="Ubah tema"
      disabled
    >
      <Sun className="size-4 opacity-50" />
      <span className="sr-only">Ubah tema</span>
    </Button>
  );
}

/** Client-only gate without setState-in-effect (SSR → false, client → true). */
function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useHasMounted();

  if (!mounted) {
    return <ThemeSwitcherPlaceholder className={className} />;
  }

  const activeTheme = (theme ?? "system") as ThemeValue;
  const activeLabel =
    themes.find((item) => item.value === activeTheme)?.label ?? "Tema";

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn("relative size-9 shrink-0", className)}
              aria-label={`Tema: ${activeLabel}`}
            >
              <Sun
                className={cn(
                  "size-4 transition-all",
                  resolvedTheme === "dark"
                    ? "scale-0 rotate-90"
                    : "scale-100 rotate-0",
                )}
              />
              <Moon
                className={cn(
                  "absolute size-4 transition-all",
                  resolvedTheme === "dark"
                    ? "scale-100 rotate-0"
                    : "scale-0 -rotate-90",
                )}
              />
              <span className="sr-only">Ubah tema</span>
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="sm:hidden">
          Tema: {activeLabel}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Tampilan
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={activeTheme}
          onValueChange={(value) => setTheme(value as ThemeValue)}
        >
          {themes.map((item) => (
            <DropdownMenuRadioItem key={item.value} value={item.value}>
              <item.icon className="size-4" />
              {item.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
