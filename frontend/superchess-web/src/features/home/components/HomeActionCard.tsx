import Link from "next/link";
import type { ReactNode } from "react";
import clsx from "clsx";

type HomeActionCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  featured?: boolean;
  disabled?: boolean;
  isBusy?: boolean;
  showDescription?: boolean;
};

export function HomeActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  featured = false,
  disabled = false,
  isBusy = false,
  showDescription = false,
}: HomeActionCardProps) {
  const content = (
    <>
      <span
        className={clsx(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg",
          featured
            ? "bg-accent text-text-inverse"
            : "bg-icon-muted text-text-primary"
        )}
      >
        {icon}
      </span>

      <div className="relative min-h-12 min-w-0 flex-1 overflow-visible">
        <h2
          className={clsx(
            "absolute left-0 max-w-full truncate text-lg font-bold text-text-primary transition-transform duration-200 ease-out",
            showDescription
              ? "top-1 translate-y-0"
              : "top-1/2 -translate-y-1/2",
            !showDescription && !disabled && "group-hover:translate-y-[-1.35rem]"
          )}
        >
          {title}
        </h2>

        <div className="absolute left-0 top-7 w-full overflow-hidden">
          <p
            className={clsx(
              "truncate text-xs text-text-muted transition duration-250 ease-out",
              showDescription
                ? "translate-x-0 opacity-100"
                : "opacity-0",
              !showDescription &&
                !disabled &&
                "-translate-x-full group-hover:translate-x-0 group-hover:opacity-100"
            )}
          >
            {description}
          </p>
        </div>
      </div>
    </>
  );

  const className = clsx(
    "group flex min-h-16 items-center gap-5 rounded-xl border border-border-light bg-card px-5 py-3 shadow-sm transition",
    featured && "border-accent-muted",
    disabled
      ? "cursor-default opacity-65"
      : "hover:border-accent-soft hover:bg-card-hover"
  );

  if (onClick && !disabled) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isBusy}
        className={clsx(className, "text-left disabled:cursor-wait disabled:opacity-70")}
      >
        {content}
      </button>
    );
  }

  if (disabled || !href) {
    return (
      <div className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
