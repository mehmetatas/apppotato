export type Theme = "system" | "light" | "dark";

/**
 * Get the stored theme from localStorage
 */
export const getStoredTheme = (): Theme => {
  if (typeof localStorage === "undefined") {return "system";}
  return (localStorage.getItem("theme") as Theme) || "system";
};

/**
 * Apply the given theme to the document
 */
export const applyTheme = (theme?: Theme): void => {
  const effectiveTheme = theme ?? getStoredTheme();
  const root = document.documentElement;

  if (effectiveTheme === "dark") {
    root.classList.add("dark");
  } else if (effectiveTheme === "light") {
    root.classList.remove("dark");
  } else {
    // System preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
};

/**
 * Save and apply a theme
 */
export const setTheme = (theme: Theme): void => {
  localStorage.setItem("theme", theme);
  applyTheme(theme);
};

/**
 * Check if the current effective theme is dark
 */
export const isDarkMode = (): boolean => {
  return document.documentElement.classList.contains("dark");
};
