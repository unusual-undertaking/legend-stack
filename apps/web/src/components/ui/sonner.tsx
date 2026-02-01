import * as React from "react"
import { Toaster as Sonner } from "sonner"

import { useTheme } from "@/components/theme-provider"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
    const { resolvedTheme } = useTheme()

    return (
        <Sonner
            theme={resolvedTheme}
            richColors
            closeButton
            toastOptions={{
                classNames: {
                    toast: "bg-background text-foreground border border-border",
                    description: "text-muted-foreground",
                    actionButton: "bg-primary text-primary-foreground",
                    cancelButton: "bg-muted text-muted-foreground",
                },
            }}
            {...props}
        />
    )
}
