import { type Theme } from "@/components/theme-provider";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const storageKey = "ui-theme";

export const getThemeServerFn = createServerFn().handler(async () => {
    return (getCookie(storageKey) || "system") as Theme;
});

export const setThemeServerFn = createServerFn({ method: "POST" })
    .inputValidator((data: unknown) => {
        if (typeof data != "string" || !["dark", "light", "system"].includes(data)) {
            throw new Error("Invalid theme provided");
        }
        return data as Theme;
    })
    .handler(async ({ data }) => {
        setCookie(storageKey, data);
    });
