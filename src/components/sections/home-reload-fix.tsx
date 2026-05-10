"use client";

import { useEffect } from "react";

export const HomeReloadFix = (): null => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) window.history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return null;
};

