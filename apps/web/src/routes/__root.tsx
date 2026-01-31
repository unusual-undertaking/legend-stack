/// <reference types="vite/client" />
import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouteContext, Outlet, Scripts, HeadContent } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import type { ConvexQueryClient } from "@convex-dev/react-query";
import * as React from "react";
import { Suspense } from "react";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getThemeServerFn } from "@/lib/theme";
import { authClient } from "@/lib/auth-client";
import { getToken } from "@/lib/auth-server";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import appCss from "@/styles/app.css?url";

// Get auth information for SSR using available cookies
const getAuth = createServerFn({ method: "GET" }).handler(async () => {
    return await getToken();
});

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
    convexQueryClient: ConvexQueryClient;
}>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "TanStack Start Starter",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    beforeLoad: async (ctx) => {
        const token = await getAuth();
        // all queries, mutations and actions through TanStack Query will be
        // authenticated during SSR if we have a valid token
        if (token) {
            // During SSR only (the only time serverHttpClient exists),
            // set the auth token to make HTTP queries with.
            ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
        }

        // Get the theme from the cookie
        const theme = await getThemeServerFn();

        return {
            isAuthenticated: !!token,
            token,
            theme,
        };
    },
    component: RootComponent,
});

function RootComponent() {
    const context = useRouteContext({ from: Route.id });

    return (
        <ConvexBetterAuthProvider
            client={context.convexQueryClient.convexClient}
            authClient={authClient}
            initialToken={context.token}
        >
            <ThemeProvider theme={context.theme}>
                <RootDocument>
                    <Outlet />
                </RootDocument>
            </ThemeProvider>
        </ConvexBetterAuthProvider>
    );
}

function RootDocument({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();

    return (
        <html className={resolvedTheme}>
            <head>
                <HeadContent />
            </head>
            <body className="bg-sidebar text-neutral-50">
                {children}
                <Toaster />
                <ReactQueryDevtools />
                <TanStackRouterDevtools position="bottom-right" />
                <Scripts />
            </body>
        </html>
    );
}
