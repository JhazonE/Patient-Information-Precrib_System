"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    try {
      const t = localStorage.getItem("theme");
      const useDark =
        t === "dark" ||
        (t === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.setAttribute(
        "data-theme",
        useDark ? "dark" : "light"
      );
    } catch {}
  }, []);

  return null;
}
