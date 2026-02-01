import { ScriptOnce } from "@tanstack/react-router"
import { createContext, use, useEffect, useState, useMemo } from "react"

export type ResolvedTheme = "dark" | "light"
export type Theme = ResolvedTheme | "system"

interface ThemeProviderProps {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

interface ThemeProviderState {
    theme: Theme
    resolvedTheme: ResolvedTheme
    setTheme: (theme: Theme) => void
}

const permittedThemes = ["light", "dark", "system"] as const

const isTheme = (value: string | null): value is Theme =>
    value !== null && permittedThemes.includes(value as Theme)

const normalizeTheme = (value: string | null, fallback: Theme): Theme =>
    isTheme(value) ? value : fallback
const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

const isBrowser = typeof window !== "undefined"

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "conar.theme",
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (!isBrowser) return defaultTheme
        return normalizeTheme(localStorage.getItem(storageKey), defaultTheme)
    })
    const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")

    useEffect(() => {
        const root = window.document.documentElement
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

        function updateTheme() {
            root.classList.remove("light", "dark")

            const nextTheme = normalizeTheme(theme, defaultTheme)

            if (nextTheme === "system") {
                const systemTheme = mediaQuery.matches ? "dark" : "light"
                setResolvedTheme(systemTheme)
                root.classList.add(systemTheme)
                return
            }

            setResolvedTheme(nextTheme as ResolvedTheme)
            root.classList.add(nextTheme)
        }

        mediaQuery.addEventListener("change", updateTheme)
        updateTheme()

        return () => mediaQuery.removeEventListener("change", updateTheme)
    }, [defaultTheme, theme])

    const value = useMemo(
        () => ({
            theme,
            resolvedTheme,
            setTheme: (nextTheme: Theme) => {
                const normalizedTheme = normalizeTheme(nextTheme, defaultTheme)
                localStorage.setItem(storageKey, normalizedTheme)
                setThemeState(normalizedTheme)
            },
        }),
        [defaultTheme, theme, resolvedTheme, storageKey],
    )

    return (
        <ThemeProviderContext.Provider value={value}>
            <FunctionOnce
                param={{
                    storageKey,
                    defaultTheme,
                    permittedThemes,
                }}
            >
                {(params) => {
                    const storedTheme = localStorage.getItem(params.storageKey)
                    const theme =
                        storedTheme && params.permittedThemes.includes(storedTheme as Theme)
                            ? (storedTheme as Theme)
                            : params.defaultTheme

                    if (
                        theme === "dark" ||
                        (theme === "system" &&
                            window.matchMedia("(prefers-color-scheme: dark)").matches)
                    ) {
                        document.documentElement.classList.remove("light")
                        document.documentElement.classList.add("dark")
                    }
                }}
            </FunctionOnce>
            {children}
        </ThemeProviderContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
    const context = use(ThemeProviderContext)

    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
}

function FunctionOnce<T = unknown>({
    children,
    param,
}: {
    children: (param: T) => unknown
    param?: T
}) {
    return <ScriptOnce>{`(${children.toString()})(${JSON.stringify(param)})`}</ScriptOnce>
}
