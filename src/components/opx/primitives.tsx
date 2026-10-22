import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type AvatarUser = { id: string; name?: string | null };

export function Logo({
  dark = false,
  imageSrc,
  imageAlt = "OPXHUB",
  className,
}: {
  dark?: boolean;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}) {
  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={imageAlt}
        draggable={false}
        className={cn("block max-h-full w-auto object-contain select-none", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0 font-display text-xl font-black leading-none tracking-[-0.08em]",
        dark ? "text-ink-foreground" : "text-foreground",
        className,
      )}
      aria-label="OPXHUB"
    >
      <span className="tracking-[-0.09em]">OP</span>
      <span
        className={cn(
          "text-lime drop-shadow-[0_0_18px_rgba(163,230,53,0.45)]",
          dark && "text-lime",
        )}
      >
        X
      </span>
      <span className="tracking-[-0.09em]">HUB</span>
    </span>
  );
}

export function BrandLogo({
  className,
  width,
  height,
  alt = "OPXHUB",
}: {
  className?: string;
  width?: number;
  height?: number;
  alt?: string;
}) {
  return (
    <img
      src="/opxhub-logo.png"
      alt={alt}
      width={width}
      height={height}
      draggable={false}
      className={cn("block object-contain select-none", className)}
    />
  );
}

export function UserAvatar({
  user,
  size = 40,
  ring = false,
}: {
  user?: AvatarUser;
  size?: number;
  ring?: boolean;
}) {
  const safeUser = user ?? { id: "guest", name: "Member" };
  const displayName = safeUser.name?.trim() || "Member";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2) || "M";
  const tone = (safeUser.id || "guest").charCodeAt(0) % 2 === 0;
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold",
        tone ? "bg-ink text-lime" : "bg-lime text-lime-foreground",
        ring && "ring-4 ring-card",
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function UserLink({
  user,
  className,
}: {
  user: { id: string; name: string };
  className?: string;
}) {
  return (
    <Link
      to="/profile/$id"
      params={{ id: user.id }}
      className={cn("font-semibold hover:underline", className)}
    >
      {user.name}
    </Link>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold">{children}</h3>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="surface mb-4 flex flex-wrap items-center justify-between gap-3 p-5">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function MockNote() {
  return (
    <p className="px-2 text-[11px] leading-relaxed text-muted-foreground">
      Your journey starts before your first job. Build, connect, and discover opportunities with OPXHUB.
    </p>
  );
}
