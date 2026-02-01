"use client"

import { CreditCard, EllipsisVertical, LogOut, Bell, UserCircle } from "lucide-react"
import { useQuery } from "convex/react"
import { authClient } from "@/lib/auth-client"
import { api } from "@convex-tanstack-starter-kit/backend/convex/_generated/api"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
    const { isMobile } = useSidebar()
    const { data: session, isPending: isSessionPending } = authClient.useSession()
    const profile = useQuery(api.r2.getCurrentUserProfile, {})

    const isProfileLoading = profile === undefined
    const isLoading = isSessionPending || isProfileLoading

    if (isLoading) {
        return (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <div className="grid flex-1 gap-1 text-left text-sm leading-tight">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    }

    const sessionUser = session?.user
    const email = sessionUser?.email ?? profile?.email ?? ""
    const nameFromEmail = email ? email.split("@")[0] : ""
    const name = sessionUser?.name ?? (nameFromEmail || "User")
    const avatar = profile?.avatarUrl ?? sessionUser?.image ?? undefined
    const initials =
        name
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") ||
        email.slice(0, 1).toUpperCase() ||
        "U"

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    // The expectAuth: true setting only has affect before the initial authentication.
                    // If a user signs out and signs back in, authenticated queries will likely be called
                    // before authentication is ready, resulting in an error.
                    //
                    // For this reason, the current recommendation is to reload the page on sign out.
                    // For apps that redirect based on authentication, signing out is typically all that's
                    // needed as an unauth redirect will occur after reload.
                    location.reload()
                },
            },
        })
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={avatar} alt={name} />
                                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{name}</span>
                                <span className="text-muted-foreground truncate text-xs">
                                    {email}
                                </span>
                            </div>
                            <EllipsisVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={avatar} alt={name} />
                                    <AvatarFallback className="rounded-lg">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{name}</span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {email}
                                    </span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <UserCircle />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
