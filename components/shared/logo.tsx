import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
};

// TODO(logo): Replace this inline SVG with the final Maviri mark when ready.
export function Logo({ variant = "full", className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Maviri home"
      className={cn(
        "group inline-flex items-center gap-2 text-ink transition-opacity hover:opacity-80",
        className
      )}
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-[10px] border-2 border-ink bg-accent-primary transition-transform duration-300 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M5 18L8 7L12 13L16 7L19 18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {variant === "full" && (
        <span className="font-accent text-xl font-bold tracking-tight">
          Maviri
        </span>
      )}
    </Link>
  );
}