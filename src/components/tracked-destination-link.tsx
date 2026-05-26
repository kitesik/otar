"use client";

import type { ReactNode } from "react";
import { track } from "@vercel/analytics";

type TrackedDestinationLinkProps = {
  href: string;
  service: string;
  slug: string;
  className?: string;
  children: ReactNode;
};

export function TrackedDestinationLink({
  href,
  service,
  slug,
  className,
  children,
}: TrackedDestinationLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() => {
        track("destination_click", {
          service,
          slug,
        });
      }}
    >
      {children}
    </a>
  );
}
