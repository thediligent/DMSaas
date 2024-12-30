"use client";

import React, { useEffect, useState } from "react";

export default function ThemeProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const body = document.body;
    if (isDark) {
      body.classList.add("dark");
    } else {
      body.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const ThemeContext = React.createContext({
  isDark: true,
  setIsDark: (isDark: boolean) => {}
});
