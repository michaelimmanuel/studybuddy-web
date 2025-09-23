import { cn } from "@/lib/utils"

export function TestimonialCard({
  quote,
  name,
  org,
  className,
}: {
  quote: string
  name: string
  org: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm",
        "p-5 md:p-6 w-full max-w-md",
        className,
      )}
    >
      <p className="text-sm leading-relaxed md:text-base">{quote}</p>
      <div className="mt-4 flex items-center gap-3">
        <img src="/diverse-avatars.png" alt={"Avatar of " + name} className="h-10 w-10 rounded-full" />
        <div className="text-sm">
          <div className="font-medium">{name}</div>
          <div className="text-muted-foreground">{org}</div>
        </div>
      </div>
    </div>
  )
}