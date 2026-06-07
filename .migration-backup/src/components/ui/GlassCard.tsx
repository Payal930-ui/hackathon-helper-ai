import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = false }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl border border-white/20 dark:border-white/10",
        hover && "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
