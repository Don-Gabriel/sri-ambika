import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StarRating({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={
            i < Math.round(value)
              ? "fill-amber text-amber"
              : "fill-transparent text-ivory/25"
          }
        />
      ))}
    </div>
  );
}
