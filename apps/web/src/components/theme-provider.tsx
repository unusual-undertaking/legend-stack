import { setThemeServerFn } from "@/lib/theme";
import { useRouter } from "@tanstack/react-router";
import { createContext, PropsWithChildren, use, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContextVal = {
    theme: Theme;
    resolvedTheme: "light" | "dark";
    setTheme: (val: Theme) => void;
};
type Props = PropsWithChildren<{ theme: Theme }>;

const ThemeContext = createContext<ThemeContextVal | null>(null);

function getSystemTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children, theme }: Props) {
    const router = useRouter();
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? "dark" : "light");
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const resolvedTheme = theme === "system" ? systemTheme : theme;

    function setTheme(val: Theme) {
        setThemeServerFn({ data: val });
        router.invalidate();
    }

    return <ThemeContext value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
    const val = use(ThemeContext);
    if (!val) throw new Error("useTheme called outside of ThemeProvider!");
    return val;
}
