import { createFileRoute } from "@tanstack/react-router"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { Link } from "@tanstack/react-router"
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"

export const Route = createFileRoute("/")({
    component: Home,
})

function Home() {
    // const { data } = useSuspenseQuery(convexQuery(api.tasks.get, {}));

    return (
        <>
            <AuthLoading>
                <div>Loading...</div>
            </AuthLoading>
            <Unauthenticated>
                <div>
                    <header>
                        <h1>Landing Page</h1>
                        <nav>
                            <Link
                                to="/sign-in"
                                className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/sign-up"
                                className="text-orange-400 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200 underline"
                            >
                                Sign Up
                            </Link>
                        </nav>
                    </header>
                    <main>
                        <h2>Welcome</h2>
                    </main>
                </div>
            </Unauthenticated>
            <Authenticated>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar />
                    <SidebarInset>
                        <AppHeader />
                        <main> </main>
                    </SidebarInset>
                </SidebarProvider>
            </Authenticated>
        </>
    )
}
