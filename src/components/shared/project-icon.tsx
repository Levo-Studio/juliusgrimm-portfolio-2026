"use client";

import { useState } from "react";

type ProjectIconProps = {
  /** Favicon URL, or null when the project has no public site. */
  src: string | null;
  /** Project title — its first character is the fallback glyph. */
  title: string;
  /** 18px on desktop rows, 16px in mobile and stacked lists. */
  size?: 16 | 18;
};

/**
 * The small square in front of a project. Shows the site's real favicon and falls
 * back to an accent tile carrying the project's initial — used both when a project
 * has no public URL and when its favicon fails to load, so a row never renders a
 * broken image.
 */
export const ProjectIcon = ({ src, title, size = 18 }: ProjectIconProps): React.JSX.Element => {
  const [failed, setFailed] = useState(false);
  const box = size === 16 ? "size-4" : "size-[18px]";
  const glyph = size === 16 ? "text-[8px]" : "text-[9px]";

  if (!src || failed) {
    return (
      <span
        aria-hidden
        className={`${box} ${glyph} grid shrink-0 place-items-center rounded-[4px] bg-accent font-mono font-medium text-accent-fg`}
      >
        {title.trim().charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`${box} shrink-0 rounded-[4px] object-contain`}
    />
  );
};
