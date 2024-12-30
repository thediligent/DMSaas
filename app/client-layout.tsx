"use client";

import ThemeProvider from "../components/layout/ThemeToggle/theme-provider";

export default function ClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
