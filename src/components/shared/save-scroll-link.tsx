"use client";

import Link from "next/link";
import { SCROLL_POSITION_STORAGE_KEY } from "@/components/sections/scroll-to-hash";

type SaveScrollLinkProps = React.ComponentProps<typeof Link>;

/**
 * Same as next/link, plus: remembers exactly how far down the page you were
 * before leaving, so the case-study "back" link can restore that instead of
 * recentering on the row you clicked.
 */
export const SaveScrollLink = ({ children, ...props }: SaveScrollLinkProps): React.JSX.Element => (
  <Link {...props} onClick={() => sessionStorage.setItem(SCROLL_POSITION_STORAGE_KEY, String(window.scrollY))}>
    {children}
  </Link>
);
